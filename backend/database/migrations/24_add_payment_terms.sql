-- =============================================
-- 24_add_payment_terms.sql
-- Add fields for partial payment support
-- =============================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT 'full_payment' CHECK (payment_terms IN ('full_payment', '50_percent_advance'));

COMMENT ON COLUMN public.orders.paid_amount IS 'Amount actually paid by the customer (e.g. 50% advance)';
COMMENT ON COLUMN public.orders.balance_due IS 'Remaining amount to be paid manually/offline';
COMMENT ON COLUMN public.orders.payment_terms IS 'Payment terms agreed upon (full vs partial)';
