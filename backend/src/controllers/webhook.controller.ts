import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { verifyWebhookSignature } from '../services/razorpay.service';

/**
 * Handle Razorpay Webhooks
 * Events: payment.captured, payment.failed, refund.created, etc.
 */
export const handleRazorpayWebhook = async (req: Request, res: Response) => {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;

    // req.body is a Buffer because of express.raw() in routes
    const webhookBody = req.body.toString();

    // 1. Verify webhook signature
    const isValid = verifyWebhookSignature(webhookBody, webhookSignature);

    if (!isValid) {
        console.error('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
    }

    try {
        // 2. Parse body
        const body = JSON.parse(webhookBody);
        const event = body.event;
        const payload = body.payload;

        console.log(`Received Razorpay webhook: ${event}`);

        switch (event) {
            case 'payment.captured':
                await handlePaymentCaptured(payload);
                break;

            case 'payment.failed':
                await handlePaymentFailed(payload);
                break;

            case 'refund.created':
                await handleRefundCreated(payload);
                break;

            case 'order.paid':
                await handleOrderPaid(payload);
                break;

            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        res.json({ success: true, received: true });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payload: any) {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.order_id;

    if (!orderId) {
        console.error('No order_id in payment notes');
        return;
    }

    console.log(`[Webhook] Processing payment.captured for order ${orderId}`);

    // IDEMPOTENCY CHECK
    const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('payment_status, status')
        .eq('id', orderId)
        .single();

    if (fetchError) {
        console.error('Error fetching order:', fetchError);
        return;
    }

    if (existingOrder.payment_status === 'paid' && existingOrder.status !== 'pending') {
        console.log(`[Webhook] Order ${orderId} already processed. Skipping.`);
        return;
    }

    // Update order status
    const { data: order, error } = await supabase
        .from('orders')
        .update({
            payment_status: 'paid',
            paid_amount: payment.amount / 100, // Convert from paise
            status: 'confirmed',
            razorpay_payment_id: payment.id
        })
        .eq('razorpay_order_id', payment.order_id)
        .select('*, order_items(*)')
        .single();

    if (error) {
        console.error('Error updating order:', error);
        return;
    }

    // Deduct stock if not already done
    if (order && order.order_items) {
        for (const item of order.order_items) {
            try {
                if (item.selected_variant) {
                    await supabase.rpc('deduct_variant_stock', {
                        variant_id: item.selected_variant.id,
                        qty: item.quantity
                    });
                } else {
                    await supabase.rpc('deduct_product_stock', {
                        prod_id: item.product_id,
                        qty: item.quantity
                    });
                }
            } catch (stockError) {
                console.error('Stock deduction error (may have been already deducted):', stockError);
            }
        }
    }

    console.log(`[Webhook] Payment captured and processed for order ${orderId}. Amount: ₹${payment.amount / 100}`);
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payload: any) {
    const payment = payload.payment.entity;
    const orderId = payment.notes?.order_id;

    if (!orderId) {
        console.error('No order_id in payment notes');
        return;
    }

    // Update order status to failed
    const { error } = await supabase
        .from('orders')
        .update({
            payment_status: 'failed',
            status: 'cancelled',
            razorpay_payment_id: payment.id
        })
        .eq('razorpay_order_id', payment.order_id);

    if (error) {
        console.error('Error updating failed payment:', error);
        return;
    }

    console.log(`Payment failed for order ${orderId}`);
}

/**
 * Handle refund.created event
 */
async function handleRefundCreated(payload: any) {
    const refund = payload.refund.entity;
    const paymentId = refund.payment_id;

    // Find order by payment ID
    const { data: order, error: findError } = await supabase
        .from('orders')
        .select('*')
        .eq('razorpay_payment_id', paymentId)
        .single();

    if (findError || !order) {
        console.error('Order not found for refund:', paymentId);
        return;
    }

    // Update order with refund info
    const { error } = await supabase
        .from('orders')
        .update({
            payment_status: refund.status === 'processed' ? 'refunded' : 'refund_pending',
            status: 'cancelled',
            paid_amount: order.paid_amount - (refund.amount / 100)
        })
        .eq('id', order.id);

    if (error) {
        console.error('Error updating refund status:', error);
        return;
    }

    console.log(`Refund created for order ${order.id}. Amount: ₹${refund.amount / 100}`);
}

/**
 * Handle order.paid event (backup verification)
 */
async function handleOrderPaid(payload: any) {
    const order = payload.order.entity;
    const orderId = order.notes?.order_id;

    if (!orderId) {
        console.error('No order_id in order notes');
        return;
    }

    // Double-check order is marked as paid
    const { error } = await supabase
        .from('orders')
        .update({
            payment_status: 'paid',
            status: 'confirmed'
        })
        .eq('razorpay_order_id', order.id);

    if (error) {
        console.error('Error in order.paid webhook:', error);
    }

    console.log(`Order paid event for order ${orderId}`);
}
