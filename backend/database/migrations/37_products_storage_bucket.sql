-- Migration 37: Add products storage bucket for media library
-- So admins can upload product images directly and copy public URLs

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Public Read Products Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admin Manage Products Bucket" ON storage.objects;

-- Only admins can read/write from the products bucket (not public)
CREATE POLICY "Admin Manage Products Bucket"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'products' AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    )
    WITH CHECK (
        bucket_id = 'products' AND
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );
