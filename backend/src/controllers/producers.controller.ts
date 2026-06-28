import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logAction } from '../utils/auditLogger';

// Submit producer capacity
export const submitProducerCapacity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { producer_name, capacity, spare_capacity, location_name, latitude, longitude } = req.body;
        const created_by = (req as any).user?.id || null;

        const { data, error } = await supabase
            .from('producer_capacities')
            .insert([{
                producer_name,
                capacity: Number(capacity) || 0.00,
                spare_capacity: Number(spare_capacity) || 0.00,
                location_name,
                latitude: latitude ? Number(latitude) : null,
                longitude: longitude ? Number(longitude) : null,
                status: 'pending',
                created_by
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            status: 'success',
            message: 'Producer capacity submission received and is pending review.',
            data
        });
    } catch (err) {
        next(err);
    }
};

// Get producer capacities
export const getProducerCapacities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = (req as any).user;
        const isAdmin = user?.role === 'admin';
        const { status } = req.query;

        let query = supabase
            .from('producer_capacities')
            .select('*')
            .order('created_at', { ascending: false });

        if (isAdmin) {
            // Admin can see everything and filter by status
            if (status) {
                query = query.eq('status', status);
            }
        } else {
            // Standard/Public users can only see approved entries
            query = query.eq('status', 'approved');
        }

        const { data, error } = await query;
        if (error) throw error;

        res.json({
            status: 'success',
            data
        });
    } catch (err) {
        next(err);
    }
};

// Update producer capacity (Admin only)
export const updateProducerCapacity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { producer_name, capacity, spare_capacity, location_name, latitude, longitude, status, admin_notes } = req.body;

        const updates: Record<string, any> = {};
        if (producer_name !== undefined) updates.producer_name = producer_name;
        if (capacity !== undefined) updates.capacity = Number(capacity) || 0.00;
        if (spare_capacity !== undefined) updates.spare_capacity = Number(spare_capacity) || 0.00;
        if (location_name !== undefined) updates.location_name = location_name;
        if (latitude !== undefined) updates.latitude = latitude ? Number(latitude) : null;
        if (longitude !== undefined) updates.longitude = longitude ? Number(longitude) : null;
        if (status !== undefined) updates.status = status;
        if (admin_notes !== undefined) updates.admin_notes = admin_notes;

        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('producer_capacities')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        await logAction(req, 'UPDATE', `Updated producer capacity record for '${data.producer_name}'`, {
            entity_type: 'producer_capacity',
            entity_id: id,
            entity_label: data.producer_name,
            metadata: { updates }
        });

        res.json({
            status: 'success',
            message: 'Producer capacity updated successfully.',
            data
        });
    } catch (err) {
        next(err);
    }
};

// Delete producer capacity (Admin only)
export const deleteProducerCapacity = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { data: record } = await supabase
            .from('producer_capacities')
            .select('producer_name')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('producer_capacities')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await logAction(req, 'DELETE', `Deleted producer capacity record for '${record?.producer_name || id}'`, {
            entity_type: 'producer_capacity',
            entity_id: id,
            entity_label: record?.producer_name || id
        });

        res.json({
            status: 'success',
            message: 'Producer capacity deleted successfully.'
        });
    } catch (err) {
        next(err);
    }
};
