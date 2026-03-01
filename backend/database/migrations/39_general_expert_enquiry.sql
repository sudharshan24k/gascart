-- Migration 39: Support general (unassigned) expert enquiries
-- Visitors can submit without picking a consultant; admin assigns later.

-- Make consultant_id nullable so general enquiries can be submitted without a consultant
ALTER TABLE consultant_inquiries
  ALTER COLUMN consultant_id DROP NOT NULL;

-- Add guest_email for enquiries from non-logged-in visitors
ALTER TABLE consultant_inquiries
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

COMMENT ON COLUMN consultant_inquiries.consultant_id IS 'NULL means unassigned — admin will assign an expert';
COMMENT ON COLUMN consultant_inquiries.guest_email IS 'Email for visitors who submit without an account';
