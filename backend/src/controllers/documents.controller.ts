import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Get all platform documents (public can see public docs, admins see all)
export const getDocuments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, status } = req.query;
        const user = (req as any).user;
        const isAdmin = user?.role === 'admin';

        let query = supabase
            .from('platform_documents')
            .select('*')
            .order('created_at', { ascending: false });

        // Non-admins only see public active documents
        if (!isAdmin) {
            query = query.eq('is_public', true).eq('status', 'active');
        }

        if (category) {
            query = query.eq('category', category);
        }

        if (status && isAdmin) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Get single document
export const getDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const isAdmin = user?.role === 'admin';

        const { data, error } = await supabase
            .from('platform_documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Check access permissions
        if (!isAdmin && (!data.is_public || data.status !== 'active')) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied to this document'
            });
        }

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Create document
export const createDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { title, category, file_url, file_size, version, is_public, status } = req.body;
        const admin_id = (req as any).user.id;

        const { data, error } = await supabase
            .from('platform_documents')
            .insert([{
                title,
                category,
                file_url,
                file_size,
                version: version || '1.0',
                is_public: is_public !== undefined ? is_public : true,
                status: status || 'active',
                uploaded_by: admin_id === '00000000-0000-0000-0000-000000000000' ? null : admin_id
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Update document
export const updateDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Allowlist prevents overwriting immutable fields (id, uploaded_by, created_at)
        const { title, category, file_url, file_size, version, is_public, status } = req.body;

        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (title !== undefined) updates.title = title;
        if (category !== undefined) updates.category = category;
        if (file_url !== undefined) updates.file_url = file_url;
        if (file_size !== undefined) updates.file_size = file_size;
        if (version !== undefined) updates.version = version;
        if (is_public !== undefined) updates.is_public = Boolean(is_public);
        if (status !== undefined) updates.status = status;

        const { data, error } = await supabase
            .from('platform_documents')
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

// Admin: Delete document
export const deleteDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('platform_documents')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.json({ status: 'success', message: 'Document deleted successfully' });
    } catch (err) {
        next(err);
    }
};
