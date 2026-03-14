-- =============================================
-- 44_update_order_payment_status_constraint.sql
-- Fix constraint violation when creating Razorpay orders
-- =============================================

-- Drop old conflict constraints if they exist
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated constraints to allow 'pending', 'refund_pending' for payment_status
-- and 'confirmed' for status
ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'refund_pending', 'failed'));

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Add comments for clarity
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: unpaid, pending (initiated), paid (captured), refunded, refund_pending, failed';
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, confirmed, processing, shipped, delivered, cancelled';
