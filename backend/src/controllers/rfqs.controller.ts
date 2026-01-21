import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { generateRFQPDF } from '../services/pdf.service';
import { notifyAdminOfRFQ } from '../services/email.service';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export const submitRFQ = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product_id, submitted_fields } = req.body;
        const user = (req as any).user;
        const user_id = user.id;

        // 1. Fetch product configuration for validation
        const { data: product, error: pError } = await supabase
            .from('products')
            .select('*, profiles!products_vendor_id_fkey(email)')
            .eq('id', product_id)
            .single();

        if (pError || !product) throw new Error('Product not found');

        // 2. Validate mandatory fields
        const rfqConfig = product.min_rfq_fields || [];
        const missingFields = rfqConfig
            .filter((f: any) => f.required && !submitted_fields[f.label])
            .map((f: any) => f.label);

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: `Missing mandatory technical specifications: ${missingFields.join(', ')}`
            });
        }

        // 3. Insert RFQ
        const { data, error } = await supabase
            .from('rfqs')
            .insert([{
                user_id,
                product_id,
                submitted_fields,
                status: 'new' // Normalizing to 'new' as per requirements
            }])
            .select('*, products(name)')
            .single();

        if (error) throw error;

        // 4. Generate PDF and Notify Admin (Async)
        try {
            const pdfBuffer = await generateRFQPDF({
                rfqId: data.id,
                productName: product.name,
                submittedFields: submitted_fields,
                userEmail: user.email, // Use email from token/user object directly
                createdAt: data.created_at
            });

            // Pass email explicitly as it's not in data.profiles anymore
            await notifyAdminOfRFQ({ ...data, profiles: { email: user.email } }, pdfBuffer);
        } catch (mailErr) {
            console.error('Post-submission automation failed:', mailErr);
            // Don't fail the request if just email fails
        }

        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const getMyRFQs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user_id = (req as any).user.id;
        const { data, error } = await supabase
            .from('rfqs')
            .select('*, products(name, slug)')
            .eq('user_id', user_id);

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const getAllRFQs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fetch RFQs without joining profiles
        const { data: rfqs, error } = await supabase
            .from('rfqs')
            .select('*, products(name, slug)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Manually fetch profiles
        const userIds = [...new Set(rfqs.map((r: any) => r.user_id))];
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds);

        if (profileError) throw profileError;

        // Map profiles to RFQs
        const profileMap = new Map(profiles.map((p: any) => [p.id, p]));
        const data = rfqs.map((r: any) => ({
            ...r,
            profiles: profileMap.get(r.user_id) || { email: 'Unknown', full_name: 'Unknown' }
        }));

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateRFQStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('rfqs')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const exportRFQs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { format } = req.query; // csv or excel (csv for now)

        // Fetch RFQs without profiles join
        const { data: rfqs, error } = await supabase
            .from('rfqs')
            .select('*, products(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Manually fetch profiles
        const userIds = [...new Set(rfqs.map((r: any) => r.user_id))];
        const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds);

        if (profileError) throw profileError;

        const profileMap = new Map(profiles.map((p: any) => [p.id, p]));

        const exportPath = path.join(__dirname, `../../public/exports/rfqs_${Date.now()}.csv`);
        const dir = path.dirname(exportPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        const csvWriter = createObjectCsvWriter({
            path: exportPath,
            header: [
                { id: 'id', title: 'RFQ ID' },
                { id: 'created_at', title: 'Submitted At' },
                { id: 'email', title: 'User Email' },
                { id: 'product', title: 'Product Name' },
                { id: 'status', title: 'Status' },
                { id: 'specs', title: 'Technical Specifications' }
            ]
        });

        const records = rfqs.map(r => {
            const profile = profileMap.get(r.user_id);
            return {
                id: r.id,
                created_at: r.created_at,
                email: profile?.email || 'N/A',
                product: r.products?.name,
                status: r.status,
                specs: JSON.stringify(r.submitted_fields).replace(/"/g, "'")
            };
        });

        await csvWriter.writeRecords(records);

        res.download(exportPath, (err) => {
            if (!err) fs.unlinkSync(exportPath); // Clean up
        });
    } catch (err) {
        next(err);
    }
};
