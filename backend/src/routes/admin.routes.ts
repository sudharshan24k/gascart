import { Router } from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserOrders,
    exportUsersCSV,
    exportInvoicesZIP,
    updateUser,
    getAuditLogs,
    getCareerApplications,
    updateCareerApplicationStatus,
    logAuthEvent,
    createAdmin,
    deleteAdmin
} from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, requireAdmin, getDashboardStats);
router.get('/audit-logs', requireAuth, requireAdmin, getAuditLogs);
router.post('/audit/log-auth', requireAuth, logAuthEvent); // allow all authenticated users to log their own auth events
router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/users/:userId/orders', requireAuth, requireAdmin, getUserOrders);
router.patch('/users/:userId', requireAuth, requireAdmin, updateUser);
router.post('/users/export', requireAuth, requireAdmin, exportUsersCSV);
router.post('/orders/export-invoices', requireAuth, requireAdmin, exportInvoicesZIP);

// Career Applications
router.get('/careers', requireAuth, requireAdmin, getCareerApplications);
router.post('/users/create-admin', requireAuth, requireAdmin, createAdmin);
router.delete('/users/:userId', requireAuth, requireAdmin, deleteAdmin);
router.patch('/careers/:id/status', requireAuth, requireAdmin, updateCareerApplicationStatus);

export default router;
