import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = (req.query.status as string) || 'active';
        const query = supabase.from('categories').select('*').order('name');

        if (status === 'all') {
            // no filter
        } else {
            query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('[CategoriesController] Creating category with body:', req.body);
        const { data, error } = await supabase
            .from('categories')
            .insert([{ ...req.body, status: 'active' }])
            .select()
            .single();

        if (error) {
            console.error('[CategoriesController] Insert error:', error);
            throw error;
        }
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('categories')
            .update(req.body)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Soft delete — marks category as 'deleted', no data is removed
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('categories')
            .update({ status: 'deleted' })
            .eq('id', id);
        if (error) throw error;
        res.json({ status: 'success', message: 'Category marked as deleted' });
    } catch (err) {
        next(err);
    }
};

// Hard delete — permanently removes the record. Only callable explicitly by admin.
export const permanentlyDeleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        res.json({ status: 'success', message: 'Category permanently deleted' });
    } catch (err) {
        next(err);
    }
};
