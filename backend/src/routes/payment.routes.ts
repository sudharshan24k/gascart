import { Router } from 'express';
import { createPaymentOrder, verifyPayment, getPaymentStatus } from '../controllers/payment.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Create Razorpay order
router.post('/create-order', requireAuth, createPaymentOrder);

// Verify payment after user completes payment
router.post('/verify', requireAuth, verifyPayment);

// Get payment status
router.get('/status/:paymentId', requireAuth, getPaymentStatus);

export default router;
