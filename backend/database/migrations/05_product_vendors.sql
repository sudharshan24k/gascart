-- =============================================
-- 05_product_vendors.sql
-- Many-to-many relationship: Products <-> Vendors
-- A single product can have multiple vendors
-- =============================================

CREATE TABLE IF NOT EXISTS public.product_vendors (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Optional: priority ordering, vendor-specific pricing
    priority INTEGER DEFAULT 0,
    vendor_price DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    PRIMARY KEY (product_id, vendor_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_vendors_product ON public.product_vendors(product_id);
CREATE INDEX IF NOT EXISTS idx_product_vendors_vendor ON public.product_vendors(vendor_id);

-- RLS: Product Vendors
ALTER TABLE public.product_vendors ENABLE ROW LEVEL SECURITY;

-- Public can read product-vendor associations
CREATE POLICY "Product vendors are viewable by everyone" 
    ON public.product_vendors FOR SELECT 
    USING (true);

-- Admins can manage associations
CREATE POLICY "Admins can manage product vendors" 
    ON public.product_vendors FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));
