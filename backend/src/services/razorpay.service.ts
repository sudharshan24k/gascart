import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env';

// Initialize Razorpay instance safely
const RZP_KEY = config.razorpay.keyId;
const RZP_SECRET = config.razorpay.keySecret;

if (!RZP_KEY || !RZP_SECRET) {
    console.error('[RazorpayService] CRITICAL: Razorpay credentials missing from environment variables!');
} else {
    const maskedKey = `${RZP_KEY.substring(0, 8)}...`;
    console.log('[RazorpayService] Initializing Razorpay with key prefix:', maskedKey);
}

export const razorpayInstance = new Razorpay({
    key_id: String(RZP_KEY || 'MISSING_KEY'),
    key_secret: String(RZP_SECRET || 'MISSING_SECRET'),
});

/**
 * Create a Razorpay order
 */
export const createRazorpayOrder = async (options: {
    amount: number; // Amount in paise (₹500 = 50000 paise)
    currency?: string;
    receipt: string;
    notes?: Record<string, any>;
}) => {
    try {
        console.log('[RazorpayService] Creating order with options:', {
            amount: options.amount,
            currency: options.currency || 'INR',
            receipt: options.receipt,
            notesCount: Object.keys(options.notes || {}).length
        });

        const order = await razorpayInstance.orders.create({
            amount: Math.round(options.amount),
            currency: options.currency || 'INR',
            receipt: options.receipt,
            notes: options.notes || {},
        });

        console.log('[RazorpayService] Order created successfully:', order.id);
        return { success: true, order };
    } catch (error: any) {
        console.error('[RazorpayService] Order creation failure (Full Error):', JSON.stringify(error, null, 2));
        console.error('[RazorpayService] Error stack:', error.stack);
        
        const detailedError = error.description || error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        
        return { 
            success: false, 
            error: detailedError
        };
    }
};

/**
 * Verify Razorpay payment signature
 * This ensures the payment callback is genuine and not tampered
 */
export const verifyPaymentSignature = (
    orderId: string,
    paymentId: string,
    signature: string
): boolean => {
    try {
        const generatedSignature = crypto
            .createHmac('sha256', config.razorpay.keySecret)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        return generatedSignature === signature;
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
};

/**
 * Verify webhook signature
 * Ensures webhook requests are from Razorpay
 */
export const verifyWebhookSignature = (
    webhookBody: string,
    webhookSignature: string
): boolean => {
    try {
        const generatedSignature = crypto
            .createHmac('sha256', config.razorpay.webhookSecret)
            .update(webhookBody)
            .digest('hex');

        return generatedSignature === webhookSignature;
    } catch (error) {
        console.error('Webhook signature verification error:', error);
        return false;
    }
};

/**
 * Fetch payment details
 */
export const getPaymentDetails = async (paymentId: string) => {
    try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        return { success: true, payment };
    } catch (error: any) {
        console.error('Fetch payment error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Capture payment (for manual capture mode)
 */
export const capturePayment = async (paymentId: string, amount: number) => {
    try {
        const payment = await razorpayInstance.payments.capture(paymentId, amount, 'INR');
        return { success: true, payment };
    } catch (error: any) {
        console.error('Capture payment error:', error);
        return { success: false, error: error.message };
    }
};

