-- =============================================
-- 32_add_vendor_id_to_rfqs.sql
-- Add optional vendor_id to RFQs for preferred vendor selection
-- =============================================

-- Add vendor_id column to rfqs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rfqs' AND column_name = 'vendor_id') THEN
        ALTER TABLE public.rfqs ADD COLUMN vendor_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_rfqs_vendor ON public.rfqs(vendor_id);

-- Update RLS if needed (Admin policies already cover 'ALL', so no change needed there)
-- Users can already see their own RFQs, including the new vendor_id field.
