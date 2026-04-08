-- =============================================
-- DATABASE CLEANUP FOR GO-LIVE
-- Execute this script in Supabase SQL Editor
-- WARNING: This will PERMANENTLY DELETE marketplace and transactional data.
-- =============================================

-- 1. START TRANSACTION (Optional but recommended)
BEGIN;

-- 2. CLEAR TRANSACTIONAL DATA
-- Truncate orders and carts first (they depend on products)
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.cart_items CASCADE;
TRUNCATE TABLE public.carts CASCADE;

-- 3. CLEAR ENQUIRIES AND RFQS
TRUNCATE TABLE public.rfqs CASCADE;
TRUNCATE TABLE public.vendor_enquiries CASCADE;

-- 4. CLEAR MARKETPLACE DATA
-- product_vendors handles the link between products and profiles
TRUNCATE TABLE public.product_vendors CASCADE;
-- products table includes variants, documents, and inventory info (as columns)
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.categories CASCADE;

-- 5. CLEAR EXPERT/CONSULTANT DATA
TRUNCATE TABLE public.consultant_inquiries CASCADE;
TRUNCATE TABLE public.consultants CASCADE;

-- 6. CLEAR CONTENT AND LOGS
TRUNCATE TABLE public.articles CASCADE;
TRUNCATE TABLE public.admin_audit_logs CASCADE;
TRUNCATE TABLE public.career_applications CASCADE;

-- OPTIONAL: Clear platform documents (T&C, etc. if you want to upload fresh versions)
-- TRUNCATE TABLE public.platform_documents CASCADE;

-- =============================================
-- DATA PRESERVATION VERIFICATION
-- The following tables were NOT touched:
-- - public.profiles
-- - public.user_addresses
-- - auth.users (Supabase internal)
-- =============================================

COMMIT;

-- Verify results
SELECT 'profiles' as table_name, count(*) as count FROM public.profiles
UNION ALL
SELECT 'products', count(*) FROM public.products
UNION ALL
SELECT 'orders', count(*) FROM public.orders
UNION ALL
SELECT 'rfqs', count(*) FROM public.rfqs
UNION ALL
SELECT 'consultants', count(*) FROM public.consultants;
