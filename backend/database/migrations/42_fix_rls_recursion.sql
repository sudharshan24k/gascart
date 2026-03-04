-- =============================================
-- 42_fix_rls_recursion.sql
-- Fix infinite recursion in RLS policies for profiles and storage buckets
-- Allow public resume uploads
-- =============================================

-- 1. Fix public.profiles recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can manage all profiles" 
    ON public.profiles FOR ALL 
    USING (public.is_admin());

-- 2. Fix Storage Buckets Admin Policy recursions (replaces inline SELECT with public.is_admin())

-- 33_storage_buckets.sql
DROP POLICY IF EXISTS "Admin Full Access" ON storage.objects;
CREATE POLICY "Admin Full Access"
    ON storage.objects FOR ALL
    USING (
        bucket_id IN ('categories', 'articles', 'platform-documents', 'avatars') AND
        public.is_admin()
    );

-- 37_products_storage_bucket.sql
DROP POLICY IF EXISTS "Admin Manage Products Bucket" ON storage.objects;
CREATE POLICY "Admin Manage Products Bucket"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'products' AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'products' AND public.is_admin()
    );

-- 29_vendor_enquiry_documents.sql
DROP POLICY IF EXISTS "Admins can manage vendor documents" ON storage.objects;
CREATE POLICY "Admins can manage vendor documents"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'vendor-documents' AND public.is_admin()
    );

-- 41_career_applications.sql
DROP POLICY IF EXISTS "Admin Manage Resumes Bucket" ON storage.objects;
CREATE POLICY "Admin Manage Resumes Bucket" ON storage.objects FOR ALL 
    USING (
        bucket_id = 'resumes' AND public.is_admin()
    );

-- 3. Allow Public Resume Uploads
-- The resumes bucket requires an INSERT policy for applicants to submit resumes via the frontend Career portal
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
CREATE POLICY "Anyone can upload resumes"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'resumes' );
