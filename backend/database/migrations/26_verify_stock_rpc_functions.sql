-- =============================================
-- 26_verify_stock_rpc_functions.sql
-- Verification and re-creation of stock management RPC functions
-- This ensures all required functions exist
-- =============================================

-- Drop existing functions if they exist (to allow re-running)
DROP FUNCTION IF EXISTS deduct_product_stock(UUID, INTEGER);
DROP FUNCTION IF EXISTS restore_product_stock(UUID, INTEGER);
DROP FUNCTION IF EXISTS deduct_variant_stock(UUID, INTEGER);
DROP FUNCTION IF EXISTS restore_variant_stock(UUID, INTEGER);

-- ============================================= 
-- PRODUCT STOCK FUNCTIONS
-- =============================================

-- Deduct Product Stock (Atomic Operation)
CREATE OR REPLACE FUNCTION deduct_product_stock(prod_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Attempt to deduct stock only if sufficient quantity available
    UPDATE public.products
    SET stock_quantity = stock_quantity - qty
    WHERE id = prod_id AND stock_quantity >= qty;
    
    -- Raise exception if update didn't affect any rows (insufficient stock)
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %. Available: %, Requested: %', 
            prod_id, 
            (SELECT stock_quantity FROM public.products WHERE id = prod_id),
            qty;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore Product Stock (For order cancellations)
CREATE OR REPLACE FUNCTION restore_product_stock(prod_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity + qty
    WHERE id = prod_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Product % not found', prod_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================= 
-- VARIANT STOCK FUNCTIONS
-- =============================================

-- Deduct Variant Stock (Atomic Operation)
CREATE OR REPLACE FUNCTION deduct_variant_stock(variant_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Attempt to deduct stock only if sufficient quantity available
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - qty
    WHERE id = variant_id AND stock_quantity >= qty;
    
    -- Raise exception if update didn't affect any rows (insufficient stock)
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for variant %. Available: %, Requested: %',
            variant_id,
            (SELECT stock_quantity FROM public.product_variants WHERE id = variant_id),
            qty;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore Variant Stock (For order cancellations)
CREATE OR REPLACE FUNCTION restore_variant_stock(variant_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity + qty
    WHERE id = variant_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant % not found', variant_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================= 
-- GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION deduct_product_stock TO authenticated;
GRANT EXECUTE ON FUNCTION restore_product_stock TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_variant_stock TO authenticated;
GRANT EXECUTE ON FUNCTION restore_variant_stock TO authenticated;

-- Grant execute permissions to service role
GRANT EXECUTE ON FUNCTION deduct_product_stock TO service_role;
GRANT EXECUTE ON FUNCTION restore_product_stock TO service_role;
GRANT EXECUTE ON FUNCTION deduct_variant_stock TO service_role;
GRANT EXECUTE ON FUNCTION restore_variant_stock TO service_role;

-- ============================================= 
-- VERIFICATION
-- =============================================

-- Verify all functions exist
DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name IN (
        'deduct_product_stock',
        'restore_product_stock',
        'deduct_variant_stock',
        'restore_variant_stock'
      );
    
    IF func_count = 4 THEN
        RAISE NOTICE '✅ All 4 stock management RPC functions created successfully!';
    ELSE
        RAISE WARNING '⚠️  Expected 4 functions, found %', func_count;
    END IF;
END $$;
