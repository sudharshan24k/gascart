-- =============================================
-- 10_consultants.sql
-- Expert/Consultant profiles and applications
-- =============================================

CREATE TABLE IF NOT EXISTS public.consultants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Link to user profile
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    
    -- Basic info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    
    -- Professional info
    bio TEXT,
    experience_years TEXT, -- e.g., "5+ years"
    
    -- Expertise
    service_categories TEXT[] DEFAULT '{}', -- Industrial Gas, Biogas, etc.
    certifications TEXT[] DEFAULT '{}',
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    is_visible BOOLEAN DEFAULT false, -- Show on public experts page
    
    -- Profile media
    profile_image_url TEXT,
    resume_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_consultants_status ON public.consultants(status);
CREATE INDEX IF NOT EXISTS idx_consultants_visible ON public.consultants(is_visible);
CREATE INDEX IF NOT EXISTS idx_consultants_email ON public.consultants(email);

-- RLS: Consultants
ALTER TABLE public.consultants ENABLE ROW LEVEL SECURITY;

-- Visible consultants are public
CREATE POLICY "Visible consultants are public" 
    ON public.consultants FOR SELECT 
    USING (
        (status = 'approved' AND is_visible = true) 
        OR auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can insert their own consultant application
CREATE POLICY "Users can apply as consultant" 
    ON public.consultants FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own profile
CREATE POLICY "Users can update own consultant profile" 
    ON public.consultants FOR UPDATE 
    USING (auth.uid() = user_id);

-- Admins can manage all consultants
CREATE POLICY "Admins can manage consultants" 
    ON public.consultants FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));
