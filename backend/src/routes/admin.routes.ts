import { Router } from 'express';
import { getDashboardStats, getAllUsers, getUserOrders, exportUsersCSV, exportInvoicesZIP, updateUser, getAuditLogs, getCareerApplications, updateCareerApplicationStatus } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, requireAdmin, getDashboardStats);
router.get('/audit-logs', requireAuth, requireAdmin, getAuditLogs);
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/users/:userId/orders', requireAuth, requireAdmin, getUserOrders);
router.patch('/users/:userId', requireAuth, requireAdmin, updateUser);
router.post('/users/export', requireAuth, requireAdmin, exportUsersCSV);
router.post('/orders/export-invoices', requireAuth, requireAdmin, exportInvoicesZIP);

// Career Applications
router.get('/careers', requireAuth, requireAdmin, getCareerApplications);
router.patch('/careers/:id/status', requireAuth, requireAdmin, updateCareerApplicationStatus);

export default router;
