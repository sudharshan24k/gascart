-- =============================================
-- 14_product_variants.sql
-- Support for Product Variants (Size, Purity, etc.)
-- =============================================

-- 1. Add variants to products
-- Structure: [{ "id": "uuid", "sku": "...", "price": 100, "stock": 10, "attributes": { "Size": "50L" } }]
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 2. Add selected_variant to Cart Items
-- Stores the snapshot of the variant at add-to-cart time
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS selected_variant JSONB DEFAULT NULL;

-- 3. Add selected_variant to Order Items
-- Stores the snapshot of the variant at purchase time (for history)
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS selected_variant JSONB DEFAULT NULL;

-- Index for searching within variants (e.g. find all products with 'Size': '50L')
CREATE INDEX IF NOT EXISTS idx_products_variants ON public.products USING gin (variants);
