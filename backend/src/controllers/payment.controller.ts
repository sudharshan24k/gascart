import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

import { config } from '../config/env';

const stripe = new Stripe(config.stripe.secretKey, {
    apiVersion: '2025-01-27.acacia' as any,
});

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
    try {
        const { items, successUrl, cancelUrl, shippingDetails, billingDetails } = req.body;
        const userId = req.user?.id;

        if (!items || !items.length) {
            return res.status(400).json({ error: 'No items in checkout' });
        }

        // 1. Create a draft order in Supabase first
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                total_amount: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
                status: 'pending',
                shipping_address: shippingDetails,
                billing_address: billingDetails,
                payment_status: 'pending'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            price_at_purchase: item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 3. Create Stripe line items
        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
            },
            quantity: item.quantity,
        }));

        // 4. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
            cancel_url: cancelUrl,
            customer_email: req.user?.email,
            metadata: {
                order_id: order.id,
                userId: userId || ''
            },
        });

        // 5. Update order with session ID
        await supabase
            .from('orders')
            .update({ stripe_session_id: session.id })
            .eq('id', order.id);

        res.json({ id: session.id, url: session.url });
    } catch (error: any) {
        console.error('Checkout session error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getSessionStatus = async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        res.json({
            status: session.status,
            payment_status: session.payment_status,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
