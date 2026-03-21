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
import { getResumeSignedUrl } from '../controllers/careers.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', requireAuth, requireAdmin, getDashboardStats);
router.get('/audit-logs', requireAuth, requireAdmin, getAuditLogs);
// Note: requireAuth is relaxed here to ensure logs are captured during session transitions (logout/login)
router.post('/audit/log-auth', logAuthEvent);

router.get('/users', requireAuth, requireAdmin, getAllUsers);
router.get('/users/:userId/orders', requireAuth, requireAdmin, getUserOrders);
router.patch('/users/:userId', requireAuth, requireAdmin, updateUser);
router.post('/users/export', requireAuth, requireAdmin, exportUsersCSV);
router.post('/orders/export-invoices', requireAuth, requireAdmin, exportInvoicesZIP);

// Career Applications Management (Consolidated under /admin)
router.get('/careers', requireAuth, requireAdmin, getCareerApplications);
router.patch('/careers/:id/status', requireAuth, requireAdmin, updateCareerApplicationStatus);
router.post('/careers/signed-url', requireAuth, requireAdmin, getResumeSignedUrl);

router.post('/users/create-admin', requireAuth, requireAdmin, createAdmin);
router.delete('/users/:userId', requireAuth, requireAdmin, deleteAdmin);

export default router;
