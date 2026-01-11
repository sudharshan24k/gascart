-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'vendor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- CATEGORIES (Hierarchical)
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PRODUCTS (Updated for Industrial Models)
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.categories(id),
  vendor_id UUID REFERENCES public.profiles(id), -- Primary vendor
  images TEXT[] DEFAULT '{}',
  attributes JSONB DEFAULT '{}',
  purchase_model TEXT DEFAULT 'rfq' CHECK (purchase_model IN ('direct', 'rfq')),
  min_rfq_fields JSONB DEFAULT '[]', -- Configurable fields for RFQ
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ARTICLES (Knowledge Hub)
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  video_url TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_gated BOOLEAN DEFAULT false,
  category_id UUID REFERENCES public.categories(id),
  tags TEXT[] DEFAULT '{}',
  linked_product_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PRODUCT_VENDORS (Many-to-Many)
CREATE TABLE public.product_vendors (
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, vendor_id)
);

-- RFQS (Request for Quote Engine)
CREATE TABLE public.rfqs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES public.products(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'replied', 'closed')),
  submitted_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;

-- Articles: Public can read non-gated. Everyone can read all metadata. Content access handled in app.
CREATE POLICY "Articles are viewable by everyone" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- RFQs: Owners and Admins can view
CREATE POLICY "Users can view own RFQs" ON public.rfqs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all RFQs" ON public.rfqs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert RFQs" ON public.rfqs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Product Vendors: Public read
CREATE POLICY "Product vendors are viewable by everyone" ON public.product_vendors FOR SELECT USING (true);
CREATE POLICY "Admins can manage product vendors" ON public.product_vendors FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Rest of the existing RLS...
