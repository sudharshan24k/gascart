import { Router } from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();

// Razorpay webhooks - requires raw body for signature verification
router.post('/', express.json(), handleRazorpayWebhook);

export default router;
