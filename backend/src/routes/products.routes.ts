import { Router } from 'express';
import { getProducts, getProduct, createProduct } from '../controllers/products.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes
router.post('/', requireAuth, requireAdmin, createProduct);
// Add put/delete later

export default router;
