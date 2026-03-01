-- Migration 38: Add profile_link column to consultants table
-- Stores LinkedIn/website URL, visible to admins only (internal use)

ALTER TABLE consultants
  ADD COLUMN IF NOT EXISTS profile_link TEXT;

COMMENT ON COLUMN consultants.profile_link IS 'LinkedIn or personal website URL — visible to admins only, not displayed publicly';
