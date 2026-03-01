import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const submitApplication = async (req: Request, res: Response) => {
    try {
        const { full_name, email, phone, category, resume_url } = req.body;

        if (!full_name || !email || !phone || !category || !resume_url) {
            return res.status(400).json({ status: 'fail', message: 'All fields are required' });
        }

        const validCategories = ['Technicians', 'Officers', 'Entry level management', 'Middle management'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid category' });
        }

        const { data, error } = await supabase
            .from('career_applications')
            .insert([{ full_name, email, phone, category, resume_url }])
            .select()
            .single();

        if (error) throw error;

        // Optionally, could log an audit action here for a new submission

        res.status(201).json({
            status: 'success',
            data,
            message: 'Application submitted successfully.'
        });
    } catch (err: any) {
        console.error('[Career Controller] Submit error:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to submit application' });
    }
};
