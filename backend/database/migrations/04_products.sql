-- =============================================
-- 04_products.sql
-- Products table with industrial purchase models
-- Supports both Direct Buy and RFQ workflows
-- =============================================

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Pricing
    price DECIMAL(10, 2) NOT NULL,
    compare_at_price DECIMAL(10, 2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    
    -- Relationships
    category_id UUID REFERENCES public.categories(id),
    vendor_id UUID REFERENCES public.profiles(id), -- Primary vendor
    
    -- Media
    images TEXT[] DEFAULT '{}',
    
    -- Configurable attributes (technical specs)
    attributes JSONB DEFAULT '{}',
    
    -- Industrial Purchase Model
    purchase_model TEXT DEFAULT 'rfq' CHECK (purchase_model IN ('direct', 'rfq')),
    
    -- Dynamic RFQ field configuration
    -- Format: [{label: string, type: 'text'|'number'|'select'|'textarea', required: boolean, options?: string[]}]
    min_rfq_fields JSONB DEFAULT '[]',
    
    -- Visibility
    is_active BOOLEAN DEFAULT true, -- Legacy support
    visibility_status TEXT DEFAULT 'published' CHECK (visibility_status IN ('published', 'draft', 'hidden')),
    order_index INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(visibility_status);
CREATE INDEX IF NOT EXISTS idx_products_model ON public.products(purchase_model);

-- RLS: Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published products are viewable by everyone" 
    ON public.products FOR SELECT 
    USING (visibility_status = 'published' OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can manage products" 
    ON public.products FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    ));
