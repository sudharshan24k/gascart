-- =============================================
-- 29_vendor_enquiry_documents.sql
-- Add document_url to vendor enquiries and setup storage
-- =============================================

-- 1. Add document_url column to vendor_enquiries table
ALTER TABLE public.vendor_enquiries 
ADD COLUMN IF NOT EXISTS document_url TEXT;

-- 2. Create the storage bucket for vendor documents if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-documents', 'vendor-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Setup Storage RLS Policies
-- Allow anyone to upload a vendor document (since enquiries are public)
CREATE POLICY "Anyone can upload vendor documents"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'vendor-documents' );

-- Admins can manage all vendor documents
CREATE POLICY "Admins can manage vendor documents"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'vendor-documents' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Anyone can view public documents inside the bucket
CREATE POLICY "Public can view vendor documents"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'vendor-documents' );
