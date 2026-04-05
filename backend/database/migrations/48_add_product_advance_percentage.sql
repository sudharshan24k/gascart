-- =============================================
-- 48_add_product_advance_percentage.sql
-- Add configurable advance payment per product
-- =============================================

-- Add advance_payment_percentage to products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS advance_payment_percentage INTEGER DEFAULT 50 
CHECK (advance_payment_percentage IN (50, 75, 100));

COMMENT ON COLUMN public.products.advance_payment_percentage IS 'Percentage of the product price required as advance (50, 75, or 100 for full payment)';

-- Update orders table payment_terms constraint to allow more options
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_payment_terms_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_terms_check 
CHECK (payment_terms IN ('full_payment', '50_percent_advance', '75_percent_advance', '100_percent_advance', 'dynamic_advance'));
