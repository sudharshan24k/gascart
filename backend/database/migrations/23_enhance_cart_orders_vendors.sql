-- =============================================
-- 23_enhance_cart_orders_vendors.sql
-- Add vendor tracking to cart_items and order_items
-- Enables vendor-specific cart and order management
-- =============================================

-- Add vendor information to cart_items
ALTER TABLE public.cart_items
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vendor_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS vendor_sku TEXT;

-- Add vendor information to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS vendor_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS vendor_sku TEXT,
ADD COLUMN IF NOT EXISTS vendor_company_name TEXT;

-- Create indexes for vendor queries
CREATE INDEX IF NOT EXISTS idx_cart_items_vendor ON public.cart_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor ON public.order_items(vendor_id);

-- Add comments
COMMENT ON COLUMN public.cart_items.vendor_id IS 'Selected vendor for this cart item (from product_vendors)';
COMMENT ON COLUMN public.cart_items.vendor_price IS 'Snapshot of vendor price at time of adding to cart';
COMMENT ON COLUMN public.cart_items.vendor_sku IS 'Vendor-specific SKU for tracking';

COMMENT ON COLUMN public.order_items.vendor_id IS 'Vendor from which this item was purchased';
COMMENT ON COLUMN public.order_items.vendor_price IS 'Snapshot of vendor price at time of purchase';
COMMENT ON COLUMN public.order_items.vendor_sku IS 'Vendor-specific SKU for order fulfillment';
COMMENT ON COLUMN public.order_items.vendor_company_name IS 'Vendor company name snapshot for order history';
