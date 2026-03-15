-- =============================================
-- Migration: Add missing Razorpay Tracking Fields
-- =============================================
-- This migration adds the necessary columns to track 
-- the actual payment transactions from Razorpay.

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_payment_id text,
ADD COLUMN IF NOT EXISTS razorpay_signature text;

-- Add helpful comments to the schema
COMMENT ON COLUMN public.orders.razorpay_payment_id IS 'The unique payment ID returned by Razorpay after a successful transaction';
COMMENT ON COLUMN public.orders.razorpay_signature IS 'The cryptographic signature from Razorpay verifying authenticity';
