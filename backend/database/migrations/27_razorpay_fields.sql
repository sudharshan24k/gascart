-- =============================================
-- 27_razorpay_fields.sql
-- Add Razorpay payment fields to orders table
-- =============================================

-- Add Razorpay-specific columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Drop old Stripe column if it exists (optional cleanup)
ALTER TABLE orders DROP COLUMN IF EXISTS stripe_session_id;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- Add comments for documentation
COMMENT ON COLUMN orders.razorpay_order_id IS 'Razorpay Order ID (order_xxxxxxxxxxxxx)';
COMMENT ON COLUMN orders.razorpay_payment_id IS 'Razorpay Payment ID (pay_xxxxxxxxxxxxx)';
COMMENT ON COLUMN orders.razorpay_signature IS 'Razorpay payment signature for verification';

-- Verification
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'orders'
      AND column_name IN ('razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature');
    
    IF column_count = 3 THEN
        RAISE NOTICE '✅ All 3 Razorpay columns added successfully to orders table';
    ELSE
        RAISE WARNING '⚠️  Expected 3 columns, found %', column_count;
    END IF;
END $$;
