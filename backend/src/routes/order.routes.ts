import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrder, downloadInvoice, cancelOrder, updateTracking, exportOrdersCSV } from '../controllers/order.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth); // All order routes require auth

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.get('/:id/invoice', downloadInvoice);

router.post('/:id/cancel', cancelOrder);

// Admin Routes
router.get('/admin/export', restrictTo('admin'), exportOrdersCSV);
router.get('/admin/all', restrictTo('admin'), getAllOrders);
router.patch('/admin/:id/status', restrictTo('admin'), updateOrderStatus);
router.patch('/admin/:id/tracking', restrictTo('admin'), updateTracking);

export default router;
