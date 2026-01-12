import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Helper to get User ID safely
const getUserId = (req: Request) => (req as any).user.id;

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { full_name, phone } = req.body;

        const updates: any = {};
        if (full_name) updates.full_name = full_name;
        if (phone) updates.phone = phone;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
