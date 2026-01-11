import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Public vendor enquiry submission
export const submitVendorEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { company_name, contact_person, email, phone, business_type, certifications, message } = req.body;

        const { data, error } = await supabase
            .from('vendor_enquiries')
            .insert([{
                company_name,
                contact_person,
                email,
                phone,
                business_type,
                certifications: certifications || [],
                message
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            status: 'success',
            message: 'Your vendor enquiry has been submitted. Our team will review and contact you shortly.',
            data
        });
    } catch (err) {
        next(err);
    }
};

// Admin: Get all vendor enquiries
export const getVendorEnquiries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;

        let query = supabase
            .from('vendor_enquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Update vendor enquiry status
export const updateVendorEnquiryStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const admin_id = (req as any).user.id;

        const { data, error } = await supabase
            .from('vendor_enquiries')
            .update({
                status,
                reviewed_at: new Date().toISOString(),
                reviewed_by: admin_id
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Get all vendors (profiles with role='vendor')
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { visibility_status } = req.query;

        let query = supabase
            .from('profiles')
            .select('*')
            .eq('role', 'vendor')
            .order('created_at', { ascending: false });

        if (visibility_status) {
            query = query.eq('visibility_status', visibility_status);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Create vendor profile
export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, full_name, company_name, certifications, visibility_status, vendor_documents } = req.body;

        // First, create auth user (in real implementation, this would use Supabase Admin API)
        // For now, we'll just create the profile entry
        // NOTE: In production, you'd need to use Supabase Admin SDK to create auth users

        const { data, error } = await supabase
            .from('profiles')
            .insert([{
                email,
                full_name,
                company_name,
                role: 'vendor',
                certifications: certifications || [],
                visibility_status: visibility_status || 'inactive',
                vendor_documents: vendor_documents || {}
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Update vendor profile
export const updateVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .eq('role', 'vendor')
            .select()
            .single();

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Delete vendor
export const deleteVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)
            .eq('role', 'vendor');

        if (error) throw error;
        res.json({ status: 'success', message: 'Vendor deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// Get vendors for a product
export const getProductVendors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;

        const { data, error } = await supabase
            .from('product_vendors')
            .select('vendor_id, profiles!product_vendors_vendor_id_fkey(*)')
            .eq('product_id', productId);

        if (error) throw error;

        // Filter to only active vendors for public view
        const activeVendors = data.filter((pv: any) => pv.profiles?.visibility_status === 'active');

        res.json({ status: 'success', data: activeVendors });
    } catch (err) {
        next(err);
    }
};

// Admin: Assign vendor to product
export const assignVendorToProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product_id, vendor_id } = req.body;

        const { data, error } = await supabase
            .from('product_vendors')
            .insert([{ product_id, vendor_id }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Remove vendor from product
export const removeVendorFromProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product_id, vendor_id } = req.body;

        const { error } = await supabase
            .from('product_vendors')
            .delete()
            .eq('product_id', product_id)
            .eq('vendor_id', vendor_id);

        if (error) throw error;
        res.json({ status: 'success', message: 'Vendor removed from product' });
    } catch (err) {
        next(err);
    }
};
