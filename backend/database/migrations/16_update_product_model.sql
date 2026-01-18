-- =============================================
-- 16_update_product_model.sql
-- Update purchase_model to support 'both' (Direct + RFQ)
-- =============================================

-- We need to update the check constraint on the products table
DO $$ 
BEGIN
    -- Drop the existing constraint if it exists (standard name if not manual)
    -- If it was created without a name, we might need to find it, but usually it's products_purchase_model_check
    ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_purchase_model_check;
    
    -- Add the new constraint
    ALTER TABLE public.products ADD CONSTRAINT products_purchase_model_check 
        CHECK (purchase_model IN ('direct', 'rfq', 'both'));
END $$;
