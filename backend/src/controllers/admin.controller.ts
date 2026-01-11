import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fetch counts in parallel
        const [
            { count: totalProducts },
            { count: activeProducts },
            { count: pendingConsultants },
            { count: approvedConsultants }
        ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
            supabase.from('consultants').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
            supabase.from('consultants').select('*', { count: 'exact', head: true }).eq('status', 'approved')
        ]);

        res.json({
            status: 'success',
            data: {
                totalProducts: totalProducts || 0,
                activeProducts: activeProducts || 0,
                pendingConsultants: pendingConsultants || 0,
                approvedConsultants: approvedConsultants || 0,
                lastUpdate: new Date().toISOString()
            }
        });
    } catch (err) {
        next(err);
    }
};
