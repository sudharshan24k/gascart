-- Migration 47: Add reference number and internal comments to consultant inquiries
-- This allows admins to track inquiries with short, readable IDs and leave internal notes.

-- 1. Add columns
ALTER TABLE public.consultant_inquiries
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(20) UNIQUE,
  ADD COLUMN IF NOT EXISTS internal_comments TEXT;

-- 2. Create function to generate reference number
CREATE OR REPLACE FUNCTION public.generate_consultation_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference_number IS NULL THEN
        -- Format: CON-XXXXXX (first 6 chars of the UUID)
        NEW.reference_number := 'CON-' || UPPER(SUBSTR(NEW.id::text, 1, 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger to auto-generate reference on insert
DROP TRIGGER IF EXISTS tr_generate_consultation_reference ON public.consultant_inquiries;
CREATE TRIGGER tr_generate_consultation_reference
    BEFORE INSERT ON public.consultant_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_consultation_reference();

-- 4. Backfill existing inquiries with reference numbers
UPDATE public.consultant_inquiries
SET reference_number = 'CON-' || UPPER(SUBSTR(id::text, 1, 6))
WHERE reference_number IS NULL;
