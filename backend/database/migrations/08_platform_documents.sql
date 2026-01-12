-- =============================================
-- 08_platform_documents.sql
-- Central document repository
-- T&Cs, Privacy Policy, Vendor Agreements, etc.
-- =============================================

CREATE TABLE IF NOT EXISTS public.platform_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Document info
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Legal', 'Policy', 'Privacy', 'Technical', 'Agreement', 'Other')),
    
    -- File details
    file_url TEXT NOT NULL,
    file_size TEXT, -- e.g., "2.4 MB"
    version TEXT DEFAULT '1.0',
    
    -- Visibility
    is_public BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_platform_documents_category ON public.platform_documents(category);
CREATE INDEX IF NOT EXISTS idx_platform_documents_status ON public.platform_documents(status);
CREATE INDEX IF NOT EXISTS idx_platform_documents_public ON public.platform_documents(is_public);

-- RLS: Platform Documents
ALTER TABLE public.platform_documents ENABLE ROW LEVEL SECURITY;

-- Public documents are viewable by everyone
CREATE POLICY "Public documents viewable by everyone" 
    ON public.platform_documents FOR SELECT 
    USING (
        (is_public = true AND status = 'active') 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can manage all documents
CREATE POLICY "Admins can manage documents" 
    ON public.platform_documents FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));
