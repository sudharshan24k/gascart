-- =============================================
-- 35_categories_soft_delete.sql
-- Add soft-delete support to categories table
-- =============================================

ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_categories_status ON public.categories(status);

-- Update RLS policy to still allow admin to see deleted ones
-- (existing admin policy covers all operations; public read only shows active)
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;

CREATE POLICY "Active categories are viewable by everyone"
    ON public.categories FOR SELECT
    USING (status = 'active' OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));
