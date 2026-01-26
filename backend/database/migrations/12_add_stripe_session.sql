-- Add stripe_session_id to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
