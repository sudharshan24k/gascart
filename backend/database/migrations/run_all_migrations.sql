-- =============================================
-- RUN ALL MIGRATIONS
-- Execute this script in Supabase SQL Editor
-- =============================================

-- Migration 28: Add invoice timestamp field
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.orders.invoice_generated_at IS 'Timestamp when the invoice was first generated for this order';

CREATE INDEX IF NOT EXISTS idx_orders_invoice_generated_at ON public.orders(invoice_generated_at);

-- =============================================
-- Verify all required columns exist
-- =============================================

DO $$ 
BEGIN
    -- Check for Razorpay fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'razorpay_payment_id') THEN
        RAISE EXCEPTION 'Missing column: razorpay_payment_id. Please run migration 27_razorpay_fields.sql';
    END IF;

    -- Check for payment terms fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'paid_amount') THEN
        RAISE EXCEPTION 'Missing column: paid_amount. Please run migration 24_add_payment_terms.sql';
    END IF;

    -- Success message
    RAISE NOTICE 'All required columns verified successfully!';
END $$;

-- =============================================
-- Display migration status
-- =============================================

SELECT 
    'orders' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN (
    'razorpay_payment_id',
    'razorpay_order_id',
    'razorpay_signature',
    'paid_amount',
    'balance_due',
    'payment_terms',
    'invoice_generated_at'
)
ORDER BY column_name;
