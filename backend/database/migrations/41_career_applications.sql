-- Migration 42: Career Applications & Resume Storage

CREATE TABLE IF NOT EXISTS career_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Technicians', 'Officers', 'Entry level management', 'Middle management')),
    
    resume_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected'))
);

-- RLS: Only admins can view applications
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view career applications"
    ON career_applications FOR SELECT
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Note: Inserts are handled via a backend service so public users don't need a direct INSERT policy.

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Resumes Bucket (Admin Read-Only, backend handles uploads via service key)
DROP POLICY IF EXISTS "Admin Manage Resumes Bucket" ON storage.objects;
CREATE POLICY "Admin Manage Resumes Bucket" ON storage.objects FOR ALL USING (
    bucket_id = 'resumes' 
    AND (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
);
