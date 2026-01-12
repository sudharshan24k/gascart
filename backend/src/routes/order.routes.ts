import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/order.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth); // All order routes require auth

router.post('/', createOrder);
router.get('/', getMyOrders);

// Admin Routes
router.get('/admin/all', restrictTo('admin'), getAllOrders);
router.patch('/admin/:id/status', restrictTo('admin'), updateOrderStatus);

export default router;
