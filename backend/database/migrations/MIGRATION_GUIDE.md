# Database Migration Guide

## Stock Management RPC Functions

The following PostgreSQL RPC (Remote Procedure Call) functions are required for proper inventory management in the order system:

### Required Functions

1. **`deduct_product_stock(prod_id UUID, qty INTEGER)`**
   - Deducts stock from a product when an order is placed
   - Ensures atomic operation (prevents race conditions)
   - Throws error if insufficient stock

2. **`restore_product_stock(prod_id UUID, qty INTEGER)`**
   - Restores stock when an order is cancelled
   - Adds quantity back to product

3. **`deduct_variant_stock(variant_id UUID, qty INTEGER)`**
   - Deducts stock from a product variant
   - Same atomic operation as product stock

4. **`restore_variant_stock(variant_id UUID, qty INTEGER)`**
   - Restores stock to a product variant
   - Used for order cancellations

---

## How to Run Migrations

### Option 1: Quick Setup (Recommended)

Run the standalone verification migration that creates all functions:

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy and paste** the contents of: `26_verify_stock_rpc_functions.sql`
3. **Click Run**

This file will:
- Drop existing functions (if any)
- Create all 4 RPC functions with proper error handling
- Set correct permissions
- Verify all functions were created

---

### Option 2: Interactive Script

Use the interactive migration script:

```bash
cd backend/database/migrations
./run-migrations.sh
```

The script will:
- Guide you through running all migrations
- Show you which migrations exist
- Offer manual or automatic options

---

### Option 3: Manual Migration

If you want to run migrations manually in Supabase:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run migrations in order:
   - `01_extensions.sql`
   - `02_profiles.sql`
   - ... (all files in numeric order)
   - `17_stock_management.sql` ← **Stock RPC functions**
   - `26_verify_stock_rpc_functions.sql` ← **Verification**

---

## Verifying Functions Exist

After running migrations, verify the functions were created:

```sql
-- Run this in Supabase SQL Editor
SELECT 
    routine_name, 
    routine_type,
    data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'deduct_product_stock',
    'restore_product_stock',
    'deduct_variant_stock',
    'restore_variant_stock'
  )
ORDER BY routine_name;
```

**Expected Result:** 4 rows showing all functions

---

## Testing the Functions

You can test the functions with sample data:

```sql
-- Test deduct_product_stock
-- (Replace 'your-product-id' with actual product UUID)
SELECT deduct_product_stock('your-product-id'::UUID, 5);

-- Test restore_product_stock
SELECT restore_product_stock('your-product-id'::UUID, 5);

-- Check product stock
SELECT id, name, stock_quantity 
FROM products 
WHERE id = 'your-product-id'::UUID;
```

---

## Troubleshooting

### Function Not Found Error

If you get `function does not exist` error when placing orders:

1. Re-run `26_verify_stock_rpc_functions.sql`
2. Check permissions with: `\df deduct_product_stock` (in psql)
3. Verify functions exist using the query above

### Insufficient Stock Error

This is expected behavior when trying to order more than available:
```
ERROR: Insufficient stock for product <uuid>. Available: 10, Requested: 20
```

### Permission Denied

Ensure functions have proper grants:
```sql
GRANT EXECUTE ON FUNCTION deduct_product_stock TO authenticated;
GRANT EXECUTE ON FUNCTION deduct_product_stock TO service_role;
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `17_stock_management.sql` | Original RPC function definitions |
| `26_verify_stock_rpc_functions.sql` | Standalone migration with verification |
| `run-migrations.sh` | Interactive script to run all migrations |
| `README.md` | This guide |

---

## Next Steps

After running migrations:

1. ✅ Verify functions exist (see verification query above)
2. ✅ Test order creation to ensure stock deduction works
3. ✅ Test order cancellation to ensure stock restoration works
4. ✅ Use admin inventory controls to adjust stock levels

**Your database is now ready for full inventory management! 🎉**
