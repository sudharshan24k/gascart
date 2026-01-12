-- =============================================
-- 07_vendor_enquiries.sql
-- Public vendor application/enquiry system
-- Vendors submit interest to be listed on platform
-- =============================================

CREATE TABLE IF NOT EXISTS public.vendor_enquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Company information
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Business details
    business_type TEXT, -- Manufacturer, Distributor, etc.
    certifications TEXT[] DEFAULT '{}', -- ISO 9001, CE, etc.
    message TEXT,
    
    -- Review workflow
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES public.profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vendor_enquiries_status ON public.vendor_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_vendor_enquiries_email ON public.vendor_enquiries(email);
CREATE INDEX IF NOT EXISTS idx_vendor_enquiries_created ON public.vendor_enquiries(created_at DESC);

-- RLS: Vendor Enquiries
ALTER TABLE public.vendor_enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a vendor enquiry (no auth required)
CREATE POLICY "Anyone can submit vendor enquiries" 
    ON public.vendor_enquiries FOR INSERT 
    WITH CHECK (true);

-- Admins can view all enquiries
CREATE POLICY "Admins can view all vendor enquiries" 
    ON public.vendor_enquiries FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can manage enquiries
CREATE POLICY "Admins can manage vendor enquiries" 
    ON public.vendor_enquiries FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));
