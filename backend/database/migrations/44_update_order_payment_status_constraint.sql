-- =============================================
-- 44_update_order_payment_status_constraint.sql
-- Fix constraint violation when creating Razorpay orders
-- =============================================

-- Drop old conflict constraint if it exists
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Add updated constraint to allow 'pending' and 'refund_pending'
-- These are used by the Razorpay integration flow
ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'refund_pending', 'failed'));

-- Add a comment for clarity
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: unpaid, pending (initiated), paid (captured), refunded, refund_pending, failed';
