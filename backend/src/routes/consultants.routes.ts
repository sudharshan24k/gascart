import { Router } from 'express';
import {
    registerConsultant,
    getConsultants,
    getConsultant,
    updateConsultant,
    deleteConsultant,
    getMyConsultantProfile
} from '../controllers/consultants.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public route for registration
router.post('/register', registerConsultant);

// Public routes
router.get('/', getConsultants);
router.get('/:id', getConsultant);

// Protected routes
router.get('/my-profile', requireAuth, getMyConsultantProfile);

// Protected routes (Admin only)
router.patch('/:id', requireAuth, requireAdmin, updateConsultant);
router.delete('/:id', requireAuth, requireAdmin, deleteConsultant);


export default router;
