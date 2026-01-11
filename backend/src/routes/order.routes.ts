import { Router } from 'express';
import { createOrder, getMyOrders } from '../controllers/order.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth); // All order routes require auth

router.post('/', createOrder);
router.get('/', getMyOrders);

export default router;
