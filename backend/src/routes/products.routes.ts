import { Router } from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateInventory, getProductVendorDetails } from '../controllers/products.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:productId/vendors/:vendorId', getProductVendorDetails);

// Protected routes
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.patch('/:id/inventory', requireAuth, requireAdmin, updateInventory);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router;
