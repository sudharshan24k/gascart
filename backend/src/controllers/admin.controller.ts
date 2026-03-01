import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import archiver from 'archiver';
import { generateInvoiceBuffer, generateInvoiceStream } from '../utils/invoice.util';
import { logAction } from '../utils/auditLogger';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fetch counts in parallel
        const [
            { count: totalProducts },
            { count: activeProducts },
            { count: pendingConsultants },
            { count: approvedConsultants },
            { count: totalUsers },
            { count: totalOrders },
            { count: pendingOrders },
            { data: revenueData }, // For revenue sum
            { data: recentOrdersData } // Recently received orders
        ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('consultants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('consultants').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
            supabase.from('profiles').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
            supabase.from('orders').select('id, created_at, total_amount, status, user_id').order('created_at', { ascending: false }).limit(5)
        ]);

        const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

        // Fetch profiles for recent orders to get customer names
        const userIds = [...new Set(recentOrdersData?.map((o: any) => o.user_id) || [])];
        let profileMap = new Map();
        if (userIds.length > 0) {
            const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
            profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);
        }

        const recentOrders = recentOrdersData?.map((o: any) => ({
            ...o,
            customer_name: profileMap.get(o.user_id)?.full_name || 'Customer'
        })) || [];

        res.json({
            status: 'success',
            data: {
                totalProducts: totalProducts || 0,
                activeProducts: activeProducts || 0,
                pendingConsultants: pendingConsultants || 0,
                approvedConsultants: approvedConsultants || 0,
                totalUsers: totalUsers || 0,
                totalOrders: totalOrders || 0,
                pendingOrders: pendingOrders || 0,
                totalRevenue,
                recentOrders,
                lastUpdate: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { role, account_status } = req.query;
        let query = supabase.from('profiles').select('*');

        if (role) {
            query = query.eq('role', role);
        }
        if (account_status) {
            query = query.eq('account_status', account_status);
        }

        const { data: users, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            status: 'success',
            results: users.length,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

export const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, price))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            status: 'success',
            results: orders.length,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { role, account_status } = req.body;

        const updates: any = {};
        if (role) updates.role = role;
        if (account_status) updates.account_status = account_status;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        // Audit log
        const changes = Object.entries(updates)
            .map(([k, v]) => `${k} → ${v}`)
            .join(', ');
        await logAction(req, 'STATUS_CHANGE', `Updated user ${data?.email || userId}: ${changes}`, {
            entity_type: 'user',
            entity_id: userId,
            entity_label: data?.email || userId,
            metadata: { updates }
        });

        res.json({
            status: 'success',
            data
        });
    } catch (err) {
        next(err);
    }
};

export const exportUsersCSV = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userIds } = req.body;

        let query = supabase.from('profiles').select('*');
        if (userIds && userIds.length > 0) {
            query = query.in('id', userIds);
        }

        const { data: users, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        const headers = 'ID,Full Name,Email,Role,Joined At\n';
        const rows = users.map((u: any) =>
            `${u.id},${u.full_name || ''},${u.email},${u.role},${new Date(u.created_at).toISOString()}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
        res.send(headers + rows);
    } catch (err) {
        next(err);
    }
};

export const exportInvoicesZIP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { orderIds } = req.body;
        if (!orderIds || orderIds.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'No orders selected' });
        }

        const archive = archiver('zip', { zlib: { level: 9 } });
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', 'attachment; filename=invoices-bulk.zip');

        // Pipe archive to response
        archive.pipe(res);

        // Handle archive errors
        archive.on('error', (err) => {
            console.error('Archive error:', err);
            throw err;
        });

        // Process orders sequentially to avoid memory overload
        for (const orderId of orderIds) {
            try {
                const { stream, filename } = await generateInvoiceStream(orderId);

                // Append the stream directly to the archive (memory-efficient)
                archive.append(stream as any, { name: filename });

                // End the PDF document stream
                stream.end();
            } catch (err: any) {
                console.error(`Failed to generate invoice for ${orderId}:`, err.message);
                // Continue with other orders even if one fails
            }
        }

        // Finalize the archive (no more files will be added)
        await archive.finalize();
    } catch (err) {
        console.error('ZIP export error:', err);
        if (!res.headersSent) {
            next(err);
        }
    }
};

export const getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            action,
            entity_type,
            actor_id,
            search,
            start_date,
            end_date,
            limit = '200',
            offset = '0'
        } = req.query;

        let query = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(Number(limit))
            .range(Number(offset), Number(offset) + Number(limit) - 1);

        if (action) query = query.eq('action', action);
        if (entity_type) query = query.eq('entity_type', entity_type);
        if (actor_id) query = query.eq('actor_id', actor_id);
        if (start_date) query = query.gte('created_at', start_date as string);
        if (end_date) query = query.lte('created_at', `${end_date}T23:59:59Z`);
        if (search) query = query.ilike('description', `%${search}%`);

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            status: 'success',
            total: count,
            results: data?.length ?? 0,
            data
        });
    } catch (err) {
        next(err);
    }
};

export const getCareerApplications = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, status } = req.query;
        let query = supabase.from('career_applications').select('*').order('created_at', { ascending: false });

        if (category) query = query.eq('category', category);
        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateCareerApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('career_applications')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logAction(req, 'STATUS_CHANGE', `Updated career application status for ${data.full_name} to ${status}`, {
            entity_type: 'system',
            entity_id: id,
            entity_label: data.full_name,
            metadata: { old_status: req.body.old_status, new_status: status }
        });

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
