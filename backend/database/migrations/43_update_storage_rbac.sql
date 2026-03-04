-- =============================================
-- Migration 43: Update Storage RLS for RBAC
-- Ensures superadmins and mini admins can manage all buckets
-- =============================================

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Admin Manage Products Bucket" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all storage objects" ON storage.objects;

-- Create a comprehensive policy allowing access for all admin roles
CREATE POLICY "Admins can manage all storage objects"
ON storage.objects FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('superadmin', 'mini admin', 'admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('superadmin', 'mini admin', 'admin')
    )
);
