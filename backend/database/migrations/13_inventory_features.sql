-- =============================================
-- 13_inventory_features.sql
-- Inventory Control Enhancements
-- Adds low stock notification threshold
-- =============================================

-- Add low_stock_threshold to products if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'low_stock_threshold') THEN
        ALTER TABLE public.products ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
    END IF;
END $$;
