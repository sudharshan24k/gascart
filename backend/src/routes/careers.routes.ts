import { Router } from 'express';
import { submitApplication, getAllApplications, updateApplicationStatus, getResumeSignedUrl } from '../controllers/careers.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route for submitting applications from the frontend
router.post('/', submitApplication);

// Admin routes for managing applications
router.get('/', requireAuth, requireAdmin, getAllApplications);
router.patch('/:id/status', requireAuth, requireAdmin, updateApplicationStatus);
router.post('/signed-url', requireAuth, requireAdmin, getResumeSignedUrl);

export default router;
