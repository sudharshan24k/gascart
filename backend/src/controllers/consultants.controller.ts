import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const registerConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone,
            experience_years,
            bio,
            service_categories,
            location,
            user_id,
            qualification,
            projects_completed,
            company_name,
            profile_image
        } = req.body;

        const { data, error } = await supabase
            .from('consultants')
            .insert([{
                first_name,
                last_name,
                email,
                phone,
                experience_years,
                bio,
                service_categories,
                location,
                user_id: user_id || null,
                qualification,
                projects_completed: projects_completed || 0,
                company_name,
                profile_image,
                status: 'pending'
            }])

            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const getMyConsultantProfile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('consultants')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found

        res.json({ status: 'success', data: data || null });
    } catch (err) {
        next(err);
    }
};

export const getConsultants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, is_visible } = req.query;

        let query = supabase.from('consultants').select('*');

        // If no status is specified, default to 'approved' for public safety
        // In a real app, you might want to allow admins to see everything
        const finalStatus = status || 'approved';
        query = query.eq('status', finalStatus);

        if (is_visible !== undefined) {
            query = query.eq('is_visible', is_visible === 'true');
        } else if (!status) {
            // Default to visible for public view if not specified
            query = query.eq('is_visible', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;


        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const getConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('consultants')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ message: 'Consultant not found' });
        }

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('consultants')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const deleteConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('consultants')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ status: 'success', message: 'Consultant deleted successfully' });
    } catch (err) {
        next(err);
    }
};
