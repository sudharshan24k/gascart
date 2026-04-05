import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logAction } from '../utils/auditLogger';

// Public vendor enquiry submission
export const submitVendorEnquiry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { company_name, contact_person, email, phone, business_type, certifications, message, document_url } = req.body;

        const { data, error } = await supabase
            .from('vendor_enquiries')
            .insert([{
                company_name,
                contact_person,
                email,
                phone,
                business_type,
                certifications: certifications || [],
                message,
                document_url
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

// Public upload vendor document
export const uploadVendorDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No file uploaded' });
        }

        const file = req.file;
        const fileExt = file.originalname.split('.').pop() || 'pdf';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `applications/${fileName}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('vendor-documents')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) {
            console.error('[Vendor Upload] Storage error:', uploadError);
            throw new Error(`Failed to upload document: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('vendor-documents')
            .getPublicUrl(filePath);

        res.status(200).json({ status: 'success', data: { url: publicUrl } });
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
                reviewed_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // If approved, create the actual vendor profile
        let tempPassword;
        if (status === 'approved' && data) {
            tempPassword = Math.random().toString(36).slice(-10) + 'A1!';

            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: data.email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { full_name: data.contact_person }
            });

            let targetUserId: string | null = null;

            if (authError) {
                // If the user already exists, we should just update their existing profile instead of failing.
                if (authError.message.includes('User already registered') || authError.status === 400) {
                    console.log('[Vendor Approval] User already exists or error, attempting to find existing user by email:', data.email);
                    // Since we can't easily get user by email directly without a specific API, we can query profiles
                    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('email', data.email).single();
                    if (existingProfile) {
                        targetUserId = existingProfile.id;
                        console.log('[Vendor Approval] Found existing profile id:', targetUserId);
                    } else {
                        throw authError; // Really failed
                    }
                } else {
                    console.error('[Vendor Approval] Failed to create auth user:', authError);
                    throw authError; // Throw the error so it propagates as a proper API response instead of silently failing
                }
            } else if (authData?.user) {
                targetUserId = authData.user.id;
            }

            if (targetUserId) {
                // 2. Update auto-created/existing profile with vendor specifics
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        company_name: data.company_name,
                        role: 'vendor',
                        certifications: data.certifications || [],
                        visibility_status: 'active'
                    })
                    .eq('id', targetUserId); // Fixed: was authData.user!.id which crashes when user already exists

                if (profileError) {
                    console.error('[Vendor Approval] Failed to update profile:', profileError);
                    throw profileError;
                }
            }
        }

        res.json({ status: 'success', data: { ...data, temporary_password: tempPassword } });
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

        // 1. Create auth user with Supabase Admin API
        const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name }
        });

        if (authError) throw authError;

        // 2. The DB trigger automatically created a 'profiles' row. Update it with vendor specifics.
        const { data, error } = await supabase
            .from('profiles')
            .update({
                company_name,
                role: 'vendor',
                certifications: certifications || [],
                visibility_status: visibility_status || 'inactive',
                vendor_documents: vendor_documents || {}
            })
            .eq('id', authData.user!.id)
            .select()
            .single();

        if (error) throw error;

        await logAction(req, 'CREATE', `Created vendor profile for '${company_name}'`, {
            entity_type: 'vendor',
            entity_id: data.id,
            entity_label: company_name,
            metadata: { vendor: data }
        });

        // Include the temporary password in response so admin could share it with the vendor (if needed)
        res.status(201).json({ status: 'success', data: { ...data, temporary_password: tempPassword } });
    } catch (err) {
        next(err);
    }
};

// Admin: Update vendor profile
export const updateVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        // Allowlist prevents overwriting immutable fields (id, email, created_at, etc.)
        const {
            company_name, full_name, phone, certifications,
            visibility_status, vendor_documents, bio
        } = req.body;

        const updates: Record<string, any> = {};
        if (company_name !== undefined) updates.company_name = company_name;
        if (full_name !== undefined) updates.full_name = full_name;
        if (phone !== undefined) updates.phone = phone;
        if (certifications !== undefined) updates.certifications = certifications;
        if (visibility_status !== undefined) updates.visibility_status = visibility_status;
        if (vendor_documents !== undefined) updates.vendor_documents = vendor_documents;
        if (bio !== undefined) updates.bio = bio;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ status: 'error', message: 'No valid fields provided for update' });
        }

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

        const { data: vendor } = await supabase.from('profiles').select('company_name').eq('id', id).single();

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id)
            .eq('role', 'vendor');

        if (error) throw error;

        await logAction(req, 'DELETE', `Deleted vendor '${vendor?.company_name || id}'`, {
            entity_type: 'vendor',
            entity_id: id,
            entity_label: vendor?.company_name || id
        });

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
            .select('*, profiles!product_vendors_vendor_id_fkey(*)')
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
        const {
            product_id,
            vendor_id,
            vendor_sku,
            vendor_price,
            vendor_stock_quantity,
            vendor_lead_time_days,
            vendor_specifications,
            is_primary,
            priority
        } = req.body;

        // If setting as primary, unset other primary vendors for this product
        if (is_primary) {
            await supabase
                .from('product_vendors')
                .update({ is_primary: false })
                .eq('product_id', product_id);
        }

        const insertData: any = { product_id, vendor_id };
        if (vendor_sku !== undefined) insertData.vendor_sku = vendor_sku;
        if (vendor_price !== undefined) insertData.vendor_price = vendor_price;
        if (vendor_stock_quantity !== undefined) insertData.vendor_stock_quantity = vendor_stock_quantity;
        if (vendor_lead_time_days !== undefined) insertData.vendor_lead_time_days = vendor_lead_time_days;
        if (vendor_specifications !== undefined) insertData.vendor_specifications = vendor_specifications;
        if (is_primary !== undefined) insertData.is_primary = is_primary;
        if (priority !== undefined) insertData.priority = priority;

        const { data, error } = await supabase
            .from('product_vendors')
            .insert([insertData])
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

// Admin: Update vendor-product association details
export const updateProductVendor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { product_id, vendor_id } = req.body;

        if (!product_id || !vendor_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Both product_id and vendor_id are required'
            });
        }

        // Allowlist only legitimate vendor-product association fields
        const {
            vendor_sku, vendor_price, vendor_stock_quantity,
            vendor_lead_time_days, vendor_specifications, is_primary, priority
        } = req.body;

        const updates: Record<string, any> = {};
        if (vendor_sku !== undefined) updates.vendor_sku = vendor_sku;
        if (vendor_price !== undefined) updates.vendor_price = vendor_price;
        if (vendor_stock_quantity !== undefined) updates.vendor_stock_quantity = vendor_stock_quantity;
        if (vendor_lead_time_days !== undefined) updates.vendor_lead_time_days = vendor_lead_time_days;
        if (vendor_specifications !== undefined) updates.vendor_specifications = vendor_specifications;
        if (is_primary !== undefined) updates.is_primary = Boolean(is_primary);
        if (priority !== undefined) updates.priority = priority;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ status: 'error', message: 'No valid fields provided for update' });
        }

        // If setting as primary, unset others
        if (updates.is_primary === true) {
            await supabase
                .from('product_vendors')
                .update({ is_primary: false })
                .eq('product_id', product_id)
                .neq('vendor_id', vendor_id);
        }

        const { data, error } = await supabase
            .from('product_vendors')
            .update(updates)
            .eq('product_id', product_id)
            .eq('vendor_id', vendor_id)
            .select()
            .single();

        if (error) throw error;
        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
