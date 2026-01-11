import { Router } from 'express';
import { submitRFQ, getMyRFQs, getAllRFQs, updateRFQStatus } from '../controllers/rfqs.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', submitRFQ);
router.get('/my', getMyRFQs);

// Admin routes
router.get('/all', requireAdmin, getAllRFQs);
router.patch('/:id/status', requireAdmin, updateRFQStatus);

export default router;
