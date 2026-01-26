import { Router } from 'express';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus, getOrder, cancelOrder, updateTracking, exportOrdersCSV } from '../controllers/order.controller';
import { generateInvoice } from '../controllers/invoice.controller';
import { requireAuth, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth); // All order routes require auth

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.get('/:orderId/invoice', generateInvoice);

router.post('/:id/cancel', cancelOrder);

// Admin Routes
router.get('/admin/export', restrictTo('admin'), exportOrdersCSV);
router.get('/admin/all', restrictTo('admin'), getAllOrders);
router.patch('/admin/:id/status', restrictTo('admin'), updateOrderStatus);
router.patch('/admin/:id/tracking', restrictTo('admin'), updateTracking);

export default router;
