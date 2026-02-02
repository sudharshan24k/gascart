-- =============================================
-- 22_enhance_product_vendors.sql
-- Enhance product_vendors for multi-vendor support
-- Add vendor-specific pricing, stock, SKU, and metadata
-- =============================================

-- Add vendor-specific fields to product_vendors
ALTER TABLE public.product_vendors
ADD COLUMN IF NOT EXISTS vendor_sku TEXT,
ADD COLUMN IF NOT EXISTS vendor_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS vendor_stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vendor_lead_time_days INTEGER,
ADD COLUMN IF NOT EXISTS vendor_specifications JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add constraints
ALTER TABLE public.product_vendors
ADD CONSTRAINT check_vendor_stock_positive CHECK (vendor_stock_quantity >= 0),
ADD CONSTRAINT check_vendor_price_positive CHECK (vendor_price IS NULL OR vendor_price >= 0),
ADD CONSTRAINT check_vendor_lead_time_positive CHECK (vendor_lead_time_days IS NULL OR vendor_lead_time_days >= 0);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_product_vendors_active ON public.product_vendors(product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_product_vendors_primary ON public.product_vendors(product_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_product_vendors_price ON public.product_vendors(vendor_price) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_vendors_stock ON public.product_vendors(vendor_stock_quantity) WHERE is_active = true;

-- Add comments for documentation
COMMENT ON COLUMN public.product_vendors.vendor_sku IS 'Vendor-specific SKU or part number for this product';
COMMENT ON COLUMN public.product_vendors.vendor_price IS 'Vendor-specific selling price, overrides base product price';
COMMENT ON COLUMN public.product_vendors.vendor_stock_quantity IS 'Stock quantity maintained by this specific vendor';
COMMENT ON COLUMN public.product_vendors.vendor_lead_time_days IS 'Expected delivery/production time from this vendor in days';
COMMENT ON COLUMN public.product_vendors.vendor_specifications IS 'Vendor-specific technical details, certifications, or notes in JSON format';
COMMENT ON COLUMN public.product_vendors.is_primary IS 'Designates the default/recommended vendor for this product';
COMMENT ON COLUMN public.product_vendors.is_active IS 'Allows temporary deactivation of vendor-product association without deletion';

-- Function to ensure only one primary vendor per product
CREATE OR REPLACE FUNCTION ensure_single_primary_vendor()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this as primary, unset others for the same product
    IF NEW.is_primary = true THEN
        UPDATE public.product_vendors
        SET is_primary = false
        WHERE product_id = NEW.product_id
          AND vendor_id != NEW.vendor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single primary vendor
DROP TRIGGER IF EXISTS ensure_primary_vendor_trigger ON public.product_vendors;
CREATE TRIGGER ensure_primary_vendor_trigger
    BEFORE INSERT OR UPDATE ON public.product_vendors
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_vendor();

-- Update existing records to set first vendor as primary if none exists
UPDATE public.product_vendors pv1
SET is_primary = true
WHERE (product_id, vendor_id) IN (
    SELECT DISTINCT ON (product_id) product_id, vendor_id
    FROM public.product_vendors
    WHERE product_id NOT IN (
        SELECT product_id 
        FROM public.product_vendors 
        WHERE is_primary = true
    )
    ORDER BY product_id, created_at ASC
);
