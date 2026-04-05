import { Router } from 'express';
import { submitRFQ, getMyRFQs, getAllRFQs, updateRFQStatus, exportRFQs, exportRFQsPDF } from '../controllers/rfqs.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', submitRFQ);
router.get('/my', getMyRFQs);

// Admin routes
router.get('/all', requireAdmin, getAllRFQs);
router.get('/export', requireAdmin, exportRFQs);
router.get('/export/pdf', requireAdmin, exportRFQsPDF);
router.patch('/:id/status', requireAdmin, updateRFQStatus);

export default router;
