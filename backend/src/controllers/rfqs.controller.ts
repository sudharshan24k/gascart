import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const submitRFQ = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product_id, submitted_fields } = req.body;
        const user_id = (req as any).user.id;

        const { data, error } = await supabase
            .from('rfqs')
            .insert([{ user_id, product_id, submitted_fields }])
            .select()
            .single();

        if (error) throw error;

        // Future: Add logic to send email notification to admin here

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
        const { data, error } = await supabase
            .from('rfqs')
            .select('*, products(name, slug), profiles(email, full_name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
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
