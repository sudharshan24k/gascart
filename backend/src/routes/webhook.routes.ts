import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();

// Stripe needs the raw body for signature verification
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
