-- =============================================
-- 20_add_product_documents.sql
-- Add documents column to products table
-- =============================================

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]';

-- Comment explaining the structure
COMMENT ON COLUMN public.products.documents IS 'Array of document objects: [{"name": "Datasheet", "url": "https://..."}]';
