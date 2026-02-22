-- Create updated_at trigger function if it doesn't already exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create consultant_inquiries table in the public schema instead of platform to fix the schema error
DROP TABLE IF EXISTS public.consultant_inquiries;

CREATE TABLE public.consultant_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID NOT NULL REFERENCES public.consultants(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable if guest allows, or strict if required auth
    service_required VARCHAR(255) NOT NULL,
    timeline_preference VARCHAR(100),
    project_description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS
ALTER TABLE public.consultant_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultants can view their own inquiries"
    ON public.consultant_inquiries FOR SELECT
    USING (auth.uid() IN (SELECT user_id FROM public.consultants WHERE id = consultant_id));

CREATE POLICY "Clients can view their submitted inquiries"
    ON public.consultant_inquiries FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert inquiries"
    ON public.consultant_inquiries FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admins have full access to inquiries"
    ON public.consultant_inquiries FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_consultant_inquiries_updated_at
    BEFORE UPDATE ON public.consultant_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
