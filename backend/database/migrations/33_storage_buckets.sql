-- =============================================
-- 33_storage_buckets.sql
-- Add image_url to articles and setup storage buckets
-- =============================================

-- 1. Add image_url to articles table
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Add avatar_url to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Create Storage Buckets
-- categories: for category icons
-- articles: for article thumbnails
-- platform-documents: for legal/policy documents
-- avatars: for user profile pictures

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('categories', 'categories', true),
    ('articles', 'articles', true),
    ('platform-documents', 'platform-documents', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Setup Storage RLS Policies (Public Read, Admin Write)

-- Helper function to check if user is admin (already exists in 02_profiles.sql, but ensuring it's available)
-- CREATE OR REPLACE FUNCTION public.is_admin() ... (already defined)

-- Policy: Public Read for all buckets
CREATE POLICY "Public Read Access"
    ON storage.objects FOR SELECT
    USING ( bucket_id IN ('categories', 'articles', 'platform-documents', 'avatars') );

-- Policy: Admin Write/Manage for all buckets
CREATE POLICY "Admin Full Access"
    ON storage.objects FOR ALL
    USING (
        bucket_id IN ('categories', 'articles', 'platform-documents', 'avatars') AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can manage own avatars"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
