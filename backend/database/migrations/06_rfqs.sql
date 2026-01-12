-- =============================================
-- 06_rfqs.sql
-- Request for Quote (RFQ) system
-- Stores technical enquiries from customers
-- =============================================

CREATE TABLE IF NOT EXISTS public.rfqs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Relationships
    user_id UUID REFERENCES auth.users(id),
    product_id UUID REFERENCES public.products(id),
    
    -- Status workflow: new -> processing -> closed
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'closed')),
    
    -- Dynamic submitted fields (based on product's min_rfq_fields)
    -- Format: {field_label: value, ...}
    submitted_fields JSONB DEFAULT '{}',
    
    -- Contact info (for non-logged-in users, optional)
    contact_email TEXT,
    contact_phone TEXT,
    contact_name TEXT,
    
    -- Admin response
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rfqs_user ON public.rfqs(user_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_product ON public.rfqs(product_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON public.rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created ON public.rfqs(created_at DESC);

-- RLS: RFQs
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

-- Users can view their own RFQs
CREATE POLICY "Users can view own RFQs" 
    ON public.rfqs FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can insert RFQs
CREATE POLICY "Users can insert RFQs" 
    ON public.rfqs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all RFQs
CREATE POLICY "Admins can view all RFQs" 
    ON public.rfqs FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can manage all RFQs
CREATE POLICY "Admins can manage all RFQs" 
    ON public.rfqs FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));
