import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../config/supabase';
import { config } from '../config/env';

const stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2025-01-27.acacia' as any,
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            (req as any).rawBody || req.body, // Stripe needs raw body for signature verification
            sig,
            config.stripe.webhookSecret
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;

        if (orderId) {
            // Update order status to 'paid' and 'processing'
            const { error } = await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    status: 'processing'
                })
                .eq('id', orderId);

            if (error) {
                console.error('Error updating order after payment:', error);
                return res.status(500).json({ error: 'Failed to update order' });
            }

            // TODO: Trigger automated invoice generation here
            console.log(`Payment successful for order ${orderId}, session ${session.id}`);
        }
    }

    res.json({ received: true });
};
