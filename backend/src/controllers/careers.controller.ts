import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const submitApplication = async (req: Request, res: Response) => {
    try {
        const { full_name, email, phone, category, resume_url } = req.body;

        if (!full_name || !email || !phone || !category || !resume_url) {
            return res.status(400).json({ status: 'fail', message: 'All fields are required' });
        }

        const validCategories = ['Technicians', 'Officers', 'Entry level management', 'Middle management', 'O&M - CBG', 'O&M - CNG'];
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

export const getAllApplications = async (req: Request, res: Response) => {
    try {
        const { category, status } = req.query;
        let query = supabase
            .from('career_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (category) {
            query = query.eq('category', category);
        }
        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data
        });
    } catch (err: any) {
        console.error('[Career Controller] Fetch error:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to fetch applications' });
    }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ status: 'fail', message: 'Status is required' });
        }

        const validStatuses = ['pending', 'reviewed', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid status' });
        }

        const { data, error } = await supabase
            .from('career_applications')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data,
            message: 'Application status updated successfully.'
        });
    } catch (err: any) {
        console.error('[Career Controller] Update status error:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to update status' });
    }
};

export const getResumeSignedUrl = async (req: Request, res: Response) => {
    try {
        const { path } = req.body;

        if (!path) {
            return res.status(400).json({ status: 'fail', message: 'File path is required' });
        }

        // Generate signed URL valid for 1 hour (3600 seconds)
        const { data, error } = await supabase
            .storage
            .from('resumes')
            .createSignedUrl(path, 3600);

        if (error || !data) {
            throw error || new Error('Failed to generate signed URL');
        }

        res.status(200).json({
            status: 'success',
            data: { signedUrl: data.signedUrl }
        });
    } catch (err: any) {
        console.error('[Career Controller] Signed URL error:', err);
        res.status(500).json({ status: 'error', message: err.message || 'Failed to generate resume link' });
    }
};
