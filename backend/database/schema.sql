-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (Extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'vendor')),
  -- Vendor-specific fields
  company_name TEXT,
  certifications TEXT[] DEFAULT '{}',
  visibility_status TEXT DEFAULT 'inactive' CHECK (visibility_status IN ('active', 'inactive', 'hidden')),
  vendor_documents JSONB DEFAULT '{}', -- {cert_url, agreement_url, etc.}
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
  is_active BOOLEAN DEFAULT true, -- Legacy
  visibility_status TEXT DEFAULT 'published' CHECK (visibility_status IN ('published', 'draft', 'hidden')),
  order_index INTEGER DEFAULT 0,
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
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'closed')),
  submitted_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- VENDOR ENQUIRIES (Public vendor interest submissions)
CREATE TABLE public.vendor_enquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_type TEXT,
  certifications TEXT[] DEFAULT '{}',
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.profiles(id)
);

-- PLATFORM DOCUMENTS (Central repository for T&C, Privacy, Agreements)
CREATE TABLE public.platform_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('legal', 'privacy', 'vendor_agreement', 'technical', 'other')),
  file_url TEXT NOT NULL,
  file_size TEXT,
  version TEXT DEFAULT '1.0',
  is_public BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id)
);

-- RLS POLICIES
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_documents ENABLE ROW LEVEL SECURITY;

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

-- Vendor Enquiries: Public can insert, admins can manage
CREATE POLICY "Anyone can submit vendor enquiries" ON public.vendor_enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all vendor enquiries" ON public.vendor_enquiries FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage vendor enquiries" ON public.vendor_enquiries FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Platform Documents: Public can view public docs, admins manage all
CREATE POLICY "Public documents viewable by everyone" ON public.platform_documents FOR SELECT USING (is_public = true OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage documents" ON public.platform_documents FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
