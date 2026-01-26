-- =============================================
-- 19_user_account_status.sql
-- Add account status to profiles for admin control
-- =============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' 
CHECK (account_status IN ('active', 'deactivated', 'banned'));

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
