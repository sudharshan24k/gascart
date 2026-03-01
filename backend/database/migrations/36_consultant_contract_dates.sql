-- Migration 36: Add contract date fields to consultants table
-- These are admin-only internal fields, not entered by the consultant at registration.

ALTER TABLE consultants
  ADD COLUMN IF NOT EXISTS contract_start_date DATE,
  ADD COLUMN IF NOT EXISTS contract_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS contract_notes TEXT;

COMMENT ON COLUMN consultants.contract_start_date IS 'Set by admin when authorizing the consultant — internal use only';
COMMENT ON COLUMN consultants.contract_expiry_date IS 'Set by admin when authorizing the consultant — internal use only';
COMMENT ON COLUMN consultants.contract_notes     IS 'Optional internal notes about the contract terms';
