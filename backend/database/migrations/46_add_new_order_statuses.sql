-- =============================================
-- 46_add_new_order_statuses.sql
-- Expand constraint to allow new statuses: 'advanced', 'sent', 'rejected'
-- =============================================

-- Drop old conflict constraints if they exist
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add updated constraints to allow 'advanced', 'sent', 'rejected' for status
ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'advanced', 'processing', 'shipped', 'sent', 'delivered', 'rejected', 'cancelled'));

-- Add comments for clarity
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, confirmed, advanced, processing, shipped, sent, delivered, rejected, cancelled';
