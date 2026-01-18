-- =============================================
-- 17_stock_management.sql
-- RPC functions for atomic stock deduction and restoration
-- Handles both base products and variants
-- =============================================

-- Deduct Product Stock
CREATE OR REPLACE FUNCTION deduct_product_stock(prod_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity - qty
    WHERE id = prod_id AND stock_quantity >= qty;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', prod_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Restore Product Stock
CREATE OR REPLACE FUNCTION restore_product_stock(prod_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET stock_quantity = stock_quantity + qty
    WHERE id = prod_id;
END;
$$ LANGUAGE plpgsql;

-- Deduct Variant Stock
CREATE OR REPLACE FUNCTION deduct_variant_stock(variant_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - qty
    WHERE id = variant_id AND stock_quantity >= qty;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for variant %', variant_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Restore Variant Stock
CREATE OR REPLACE FUNCTION restore_variant_stock(variant_id UUID, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity + qty
    WHERE id = variant_id;
END;
$$ LANGUAGE plpgsql;
