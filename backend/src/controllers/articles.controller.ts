import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getArticles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, level, search } = req.query;

        let query = supabase
            .from('articles')
            .select('*, categories(name, slug)');

        if (category) query = query.eq('category_id', category);
        if (level) query = query.eq('level', level);
        if (search) query = query.ilike('title', `%${search}%`);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const getArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const { data, error } = await supabase
            .from('articles')
            .select('*, categories(*)')
            .eq('slug', slug)
            .single();

        if (error) return res.status(404).json({ message: 'Article not found' });

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const createArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('articles')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('articles')
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

export const deleteArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) throw error;
        res.json({ status: 'success', message: 'Article deleted' });
    } catch (err) {
        next(err);
    }
};
