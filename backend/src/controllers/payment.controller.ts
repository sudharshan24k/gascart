import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createRazorpayOrder, verifyPaymentSignature, getPaymentDetails } from '../services/razorpay.service';
import { config } from '../config/env';

/**
 * Create Razorpay Order for Checkout
 */
export const createPaymentOrder = async (req: AuthRequest, res: Response) => {
    try {
        const { items, shippingDetails, billingDetails } = req.body;
        const userId = req.user?.id;

        if (!items || !items.length) {
            return res.status(400).json({ error: 'No items in checkout' });
        }

        // Calculate totals
        const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const advanceAmount = totalAmount * 0.5; // 50% advance
        const balanceDue = totalAmount - advanceAmount;

        // 1. Create a draft order in database first
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                total_amount: totalAmount,
                paid_amount: 0, // Will be updated after payment
                balance_due: balanceDue,
                payment_terms: '50_percent_advance',
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
            price_at_purchase: item.price,
            selected_variant: item.selected_variant,
            vendor_id: item.vendor_id,
            vendor_price: item.vendor_price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 3. Create Razorpay Order (amount in paise, charging 50%)
        const razorpayAmount = Math.round(advanceAmount * 100); // Convert to paise
        const razorpayResult = await createRazorpayOrder({
            amount: razorpayAmount,
            currency: 'INR',
            receipt: `order_${order.id.slice(0, 8)}`,
            notes: {
                order_id: order.id,
                user_id: userId || '',
                type: 'advance_payment',
                total_order_value: totalAmount,
                advance_amount: advanceAmount,
                balance_due: balanceDue
            }
        });

        if (!razorpayResult.success || !razorpayResult.order) {
            throw new Error(razorpayResult.error || 'Failed to create Razorpay order');
        }

        // 4. Update order with Razorpay order ID
        await supabase
            .from('orders')
            .update({ razorpay_order_id: razorpayResult.order.id })
            .eq('id', order.id);

        // 5. Return order details and Razorpay key for frontend
        res.json({
            success: true,
            orderId: order.id,
            razorpayOrderId: razorpayResult.order.id,
            amount: razorpayAmount,
            currency: 'INR',
            keyId: config.razorpay.keyId, // Frontend needs this
            totalAmount,
            advanceAmount,
            balanceDue
        });
    } catch (error: any) {
        console.error('Payment order creation error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verify Payment after user completes payment
 */
/**
 * Verify Payment after user completes payment
 */
export const verifyPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
        const userId = req.user?.id;

        console.log(`[Payment Verification] Start - User: ${userId}, Order: ${order_id}, Payment: ${razorpay_payment_id}`);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error('[Payment Verification] Missing details');
            return res.status(400).json({ error: 'Missing payment details' });
        }

        // 1. Verify signature
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            console.error('[Payment Verification] Invalid signature');
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // 2. Fetch payment details from Razorpay
        const paymentResult = await getPaymentDetails(razorpay_payment_id);

        if (!paymentResult.success || !paymentResult.payment) {
            console.error('[Payment Verification] Failed to fetch from Razorpay');
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        const payment = paymentResult.payment;

        // 3. Idempotency Check: Check if order is already marked as paid
        const { data: existingOrder, error: fetchError } = await supabase
            .from('orders')
            .select('payment_status, status')
            .eq('id', order_id)
            .single();

        if (fetchError) throw fetchError;

        if (existingOrder.payment_status === 'paid' && existingOrder.status !== 'pending') {
            console.log(`[Payment Verification] Order ${order_id} already processed. Skipping stock deduction.`);
            return res.json({
                success: true,
                orderId: order_id,
                paymentStatus: payment.status,
                message: 'Payment already processed',
                invoiceUrl: `/orders/${order_id}/invoice`
            });
        }

        // 4. Update order in database
        const { data: order, error: updateError } = await supabase
            .from('orders')
            .update({
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature,
                payment_status: payment.status === 'captured' ? 'paid' : 'pending',
                paid_amount: (Number(payment.amount) || 0) / 100, // Convert from paise to rupees
                status: payment.status === 'captured' ? 'confirmed' : 'pending'
            })
            .eq('id', order_id)
            .select('*, order_items(*)')
            .single();

        if (updateError) throw updateError;

        // 5. Deduct stock if payment is successful
        if (payment.status === 'captured') {
            try {
                for (const item of order.order_items) {
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
                }

                // Clear cart items
                const { data: cart } = await supabase
                    .from('carts')
                    .select('id')
                    .eq('user_id', req.user?.id)
                    .single();

                if (cart) {
                    await supabase
                        .from('cart_items')
                        .delete()
                        .eq('cart_id', cart.id);
                }
                console.log(`[Payment Verification] Success - Order ${order_id} confirmed.`);
            } catch (stockError) {
                console.error('[Payment Verification] Stock deduction failed:', stockError);
                // Note: We don't rollback payment here, but we should alert admin or retry
            }
        }

        res.json({
            success: true,
            orderId: order.id,
            paymentStatus: payment.status,
            message: payment.status === 'captured' ? 'Payment successful' : 'Payment pending',
            invoiceUrl: payment.status === 'captured' ? `/orders/${order.id}/invoice` : null
        });
    } catch (error: any) {
        console.error('[Payment Verification] Critical Error:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get payment status
 */
export const getPaymentStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { paymentId } = req.params;

        const paymentResult = await getPaymentDetails(paymentId);

        if (!paymentResult.success || !paymentResult.payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({
            success: true,
            status: paymentResult.payment.status,
            amount: (Number(paymentResult.payment.amount) || 0) / 100,
            currency: paymentResult.payment.currency,
            method: paymentResult.payment.method
        });
    } catch (error: any) {
        console.error('Get payment status error:', error);
        res.status(500).json({ error: error.message });
    }
};
