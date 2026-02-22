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
                profile_image_url: profile_image || null,
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

export const submitConsultationInquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { consultant_id, service_required, timeline_preference, project_description } = req.body;
        const client_id = (req as any).user?.id || null;

        const { data, error } = await supabase
            .from('consultant_inquiries')
            .insert([{
                consultant_id,
                client_id,
                service_required,
                timeline_preference,
                project_description,
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

export const getConsultationInquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const { status, consultant_id } = req.query;

        let query = supabase
            .from('consultant_inquiries')
            .select(`
                *,
                consultants!inner(id, first_name, last_name),
                profiles!client_id(id, full_name, email, phone)
            `)
            .order('created_at', { ascending: false });

        if (user.role !== 'admin') {
            // If they are a consultant, they can see their own
            const { data: consultantProfile } = await supabase
                .from('consultants')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (consultantProfile) {
                query = query.eq('consultant_id', consultantProfile.id);
            } else {
                // Otherwise they are a regular client, showing what they submitted
                query = query.eq('client_id', user.id);
            }
        }

        if (status) query = query.eq('status', status);
        if (consultant_id && user.role === 'admin') query = query.eq('consultant_id', consultant_id);

        const { data, error } = await query;

        if (error) throw error;

        // Map consultant id correctly since the schema links to profile
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateConsultationInquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = (req as any).user;

        // Note: For advanced safety you could enforce that only the assigned consultant or an admin can update

        const { data, error } = await supabase
            .from('consultant_inquiries')
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
