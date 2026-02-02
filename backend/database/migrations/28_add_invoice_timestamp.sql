-- =============================================
-- 28_add_invoice_timestamp.sql
-- Add invoice_generated_at field for audit trail
-- =============================================

ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_generated_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.orders.invoice_generated_at IS 'Timestamp when the invoice was first generated for this order';

CREATE INDEX IF NOT EXISTS idx_orders_invoice_generated_at ON public.orders(invoice_generated_at);
