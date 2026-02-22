-- =============================================
-- 30_rfqs_status_completed_rejected.sql
-- Update RFQ status constraint to include completed and rejected statuses 
-- =============================================

ALTER TABLE public.rfqs DROP CONSTRAINT IF EXISTS rfqs_status_check;

ALTER TABLE public.rfqs ADD CONSTRAINT rfqs_status_check 
    CHECK (status IN ('new', 'processing', 'completed', 'rejected', 'closed'));
