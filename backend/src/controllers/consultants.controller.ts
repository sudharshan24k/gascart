import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { generateBulkInquiryPDF, InquiryDocumentData } from '../services/pdf.service';

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

        // Allowlist prevents overwriting immutable fields (id, user_id, created_at, etc.)
        const {
            first_name, last_name, email, phone, experience_years,
            bio, service_categories, location, qualification,
            profile_image_url, status, is_visible, rating, projects_completed, company_name
        } = req.body;

        const updates: Record<string, any> = {};
        if (first_name !== undefined) updates.first_name = first_name;
        if (last_name !== undefined) updates.last_name = last_name;
        if (email !== undefined) updates.email = email;
        if (phone !== undefined) updates.phone = phone;
        if (experience_years !== undefined) updates.experience_years = experience_years;
        if (bio !== undefined) updates.bio = bio;
        if (service_categories !== undefined) updates.service_categories = service_categories;
        if (location !== undefined) updates.location = location;
        if (qualification !== undefined) updates.qualification = qualification;
        if (profile_image_url !== undefined) updates.profile_image_url = profile_image_url;
        if (status !== undefined) updates.status = status;
        if (is_visible !== undefined) updates.is_visible = Boolean(is_visible);
        if (rating !== undefined) updates.rating = rating;
        if (projects_completed !== undefined) updates.projects_completed = projects_completed;
        if (company_name !== undefined) updates.company_name = company_name;

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

        // Only allow updating status and internal comments — prevents mass assignment
        // on sensitive fields like client_id, consultant_id, or created_at
        const { status, internal_comments } = req.body;

        const updates: Record<string, any> = {};
        if (status !== undefined) updates.status = status;
        if (internal_comments !== undefined) updates.internal_comments = internal_comments;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ status: 'error', message: 'No valid fields provided for update' });
        }

        const { data, error } = await supabase
            .from('consultant_inquiries')
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

export const exportInquiriesPDF = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, consultant_id, startDate, endDate, id } = req.query;

        let query = supabase
            .from('consultant_inquiries')
            .select(`
                *,
                consultants(id, first_name, last_name, email),
                profiles!client_id(id, full_name, email, phone)
            `)
            .order('created_at', { ascending: false });

        if (id) {
            query = query.eq('id', id);
        } else {
            if (status && status !== 'All') query = query.eq('status', status.toString().toLowerCase());
            if (consultant_id) query = query.eq('consultant_id', consultant_id);
            if (startDate) query = query.gte('created_at', startDate);
            if (endDate) {
                const end = new Date(endDate.toString());
                end.setDate(end.getDate() + 1);
                query = query.lt('created_at', end.toISOString());
            }
        }

        const { data: inquiries, error } = await query;
        if (error) throw error;

        if (!inquiries || inquiries.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'No inquiries found to export' });
        }

        const pdfData: InquiryDocumentData[] = inquiries.map(inq => ({
            referenceNumber: inq.reference_number || inq.id.slice(0, 8).toUpperCase(),
            clientName: inq.profiles?.full_name || 'Guest User',
            clientEmail: inq.profiles?.email || inq.guest_email || 'N/A',
            clientPhone: inq.profiles?.phone,
            serviceRequired: inq.service_required,
            timelinePreference: inq.timeline_preference,
            projectDescription: inq.project_description,
            internalComments: inq.internal_comments,
            consultantName: inq.consultants ? `${inq.consultants.first_name} ${inq.consultants.last_name}` : undefined,
            consultantEmail: inq.consultants?.email,
            status: inq.status,
            createdAt: inq.created_at
        }));

        const buffer = await generateBulkInquiryPDF(pdfData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=consultation_report_${Date.now()}.pdf`);
        res.send(buffer);

    } catch (err) {
        next(err);
    }
};
