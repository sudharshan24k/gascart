import { Router } from 'express';
import { getDashboardStats, getAllUsers, getUserOrders, exportUsersCSV, exportInvoicesZIP, updateUser } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, requireAdmin, getDashboardStats);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/users/:userId/orders', requireAuth, requireAdmin, getUserOrders);
router.patch('/users/:userId', requireAuth, requireAdmin, updateUser);
router.post('/users/export', requireAuth, requireAdmin, exportUsersCSV);
router.post('/orders/export-invoices', requireAuth, requireAdmin, exportInvoicesZIP);

export default router;
