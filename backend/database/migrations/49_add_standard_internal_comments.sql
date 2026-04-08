-- Migration 49: Add standard internal_comments column to all management entities
-- This allows admins to track offline coordination across different modules.

-- 1. Add internal_comments to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS internal_comments TEXT;

-- 2. Add internal_comments to rfqs
ALTER TABLE public.rfqs
  ADD COLUMN IF NOT EXISTS internal_comments TEXT;

-- 3. Add internal_comments to career_applications
ALTER TABLE public.career_applications
  ADD COLUMN IF NOT EXISTS internal_comments TEXT;

-- 4. Standardize vendor_enquiries (Rename admin_notes if it exists, otherwise add)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vendor_enquiries' AND column_name='admin_notes') THEN
        ALTER TABLE public.vendor_enquiries RENAME COLUMN admin_notes TO internal_comments;
    ELSE
        ALTER TABLE public.vendor_enquiries ADD COLUMN IF NOT EXISTS internal_comments TEXT;
    END IF;
END $$;
