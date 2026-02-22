import { Router } from 'express';
import multer from 'multer';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct, updateInventory, getProductVendorDetails, uploadProductImage } from '../controllers/products.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.get('/:productId/vendors/:vendorId', getProductVendorDetails);

const upload = multer({ storage: multer.memoryStorage() });

// Public upload route for admin dashboard usage (or protected depending on auth middleware order)
router.post('/upload', upload.single('image'), uploadProductImage);

// Protected routes
router.post('/', requireAuth, requireAdmin, createProduct);
router.put('/:id', requireAuth, requireAdmin, updateProduct);
router.patch('/:id/inventory', requireAuth, requireAdmin, updateInventory);
router.delete('/:id', requireAuth, requireAdmin, deleteProduct);

export default router;
