import { Router } from 'express';
import { createCheckoutSession, getSessionStatus } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/create-checkout-session', requireAuth, createCheckoutSession);
router.get('/session-status/:sessionId', requireAuth, getSessionStatus);

export default router;
