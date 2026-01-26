-- Add warehouse_location to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warehouse_location TEXT;
