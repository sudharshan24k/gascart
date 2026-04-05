import { Router } from 'express';
import {
    registerConsultant,
    getConsultants,
    getConsultant,
    updateConsultant,
    deleteConsultant,
    getMyConsultantProfile,
    submitConsultationInquiry,
    getConsultationInquiries,
    updateConsultationInquiryStatus,
    exportInquiriesPDF
} from '../controllers/consultants.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route for registration
router.post('/register', registerConsultant);

// Consultation Inquiry Routes
router.post('/inquiries', requireAuth, submitConsultationInquiry); // Require auth to submit requests
router.get('/inquiries', requireAuth, getConsultationInquiries);
router.patch('/inquiries/:id/status', requireAuth, requireAdmin, updateConsultationInquiryStatus);
router.get('/inquiries/export/pdf', requireAuth, requireAdmin, exportInquiriesPDF);

// Public routes
router.get('/', getConsultants);
router.get('/:id', getConsultant);

// Protected routes
router.get('/my-profile', requireAuth, getMyConsultantProfile);

// Protected routes (Admin only)
router.patch('/:id', requireAuth, requireAdmin, updateConsultant);
router.delete('/:id', requireAuth, requireAdmin, deleteConsultant);

export default router;
