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

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { data, error } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', userId)
            .order('is_default', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);

        // Allowlist prevents caller from overriding user_id or internal fields
        const { label, address_line1, address_line2, city, state, country, postal_code, is_default } = req.body;

        const addressData: Record<string, any> = { user_id: userId };
        if (label !== undefined) addressData.label = label;
        if (address_line1 !== undefined) addressData.address_line1 = address_line1;
        if (address_line2 !== undefined) addressData.address_line2 = address_line2;
        if (city !== undefined) addressData.city = city;
        if (state !== undefined) addressData.state = state;
        if (country !== undefined) addressData.country = country;
        if (postal_code !== undefined) addressData.postal_code = postal_code;
        if (is_default !== undefined) addressData.is_default = Boolean(is_default);

        const { data, error } = await supabase
            .from('user_addresses')
            .insert(addressData)
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        // Allowlist prevents caller from overriding user_id, id, or timestamps
        const { label, address_line1, address_line2, city, state, country, postal_code, is_default } = req.body;

        const updates: Record<string, any> = { updated_at: new Date().toISOString() };
        if (label !== undefined) updates.label = label;
        if (address_line1 !== undefined) updates.address_line1 = address_line1;
        if (address_line2 !== undefined) updates.address_line2 = address_line2;
        if (city !== undefined) updates.city = city;
        if (state !== undefined) updates.state = state;
        if (country !== undefined) updates.country = country;
        if (postal_code !== undefined) updates.postal_code = postal_code;
        if (is_default !== undefined) updates.is_default = Boolean(is_default);

        const { data, error } = await supabase
            .from('user_addresses')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { id } = req.params;

        const { error } = await supabase
            .from('user_addresses')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ status: 'success', message: 'Address deleted successfully' });
    } catch (err) {
        next(err);
    }
};

