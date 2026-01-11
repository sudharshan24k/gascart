import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category, minPrice, maxPrice, sort, search } = req.query;

        let query = supabase
            .from('products')
            .select('*, categories(name, slug)', { count: 'exact' });

        // Filtering
        if (category) {
            // Assuming category slug is passed, this might need a join or two-step lookup if specific ID is needed, 
            // but if we accept category_id it's easier. Let's assume ID or handle slug logic in service. 
            // For simplicity/perf, filtering by category_id directly is best, but UI usually uses slugs.
            // We'll trust the frontend sends ID or we look it up. Let's assume ID for now for speed, or basic text match.
            query = query.eq('category_id', category);
        }

        if (minPrice) query = query.gte('price', minPrice);
        if (maxPrice) query = query.lte('price', maxPrice);

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Sorting
        if (sort === 'price_asc') query = query.order('price', { ascending: true });
        else if (sort === 'price_desc') query = query.order('price', { ascending: false });
        else if (sort === 'newest') query = query.order('created_at', { ascending: false });
        else query = query.order('created_at', { ascending: false }); // Default

        const { data, error, count } = await query;

        if (error) throw error;

        res.json({
            status: 'success',
            results: count,
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(*)')
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ message: 'Product not found', error: error.message });
        }

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Basic validation should be here or in middleware
        const { name, price, category_id, vendor_id, slug } = req.body;

        const { data, error } = await supabase
            .from('products')
            .insert([req.body])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('products')
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

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ status: 'success', message: 'Product deleted successfully' });
    } catch (err) {
        next(err);
    }
};
