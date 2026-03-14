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
        const totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);
        
        if (isNaN(totalAmount) || totalAmount <= 0) {
            console.error('[PaymentController] Invalid total amount calculated:', totalAmount, items);
            return res.status(400).json({ error: 'Invalid checkout amount' });
        }

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
            console.error('[PaymentController] Razorpay call failed:', razorpayResult.error);
            throw new Error(`Razorpay Error: ${razorpayResult.error || 'Unknown failure'}`);
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
    const diagnostics: string[] = [];
    const addLog = (msg: string) => {
        const log = `[${new Date().toISOString()}] ${msg}`;
        diagnostics.push(log);
        console.log(log);
    };

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
        const userId = req.user?.id;

        addLog(`Start - User: ${userId}, Order: ${order_id}, Payment: ${razorpay_payment_id}`);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            addLog('Error: Missing payment details');
            return res.status(400).json({ success: false, error: 'Missing payment details', diagnostics });
        }

        // 1. Verify signature
        addLog('Verifying signature...');
        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            addLog('Error: Invalid signature');
            return res.status(400).json({ success: false, error: 'Invalid payment signature', diagnostics });
        }
        addLog('Signature valid.');

        // 2. Fetch payment details from Razorpay
        addLog('Fetching payment details from Razorpay...');
        const paymentResult = await getPaymentDetails(razorpay_payment_id);

        if (!paymentResult.success || !paymentResult.payment) {
            addLog(`Error: Razorpay fetch failed: ${paymentResult.error}`);
            return res.status(400).json({ success: false, error: 'Payment verification failed at Razorpay fetch', diagnostics });
        }
        addLog('Payment details fetched successfully.');
        const payment = paymentResult.payment;

        // 3. Update order in database
        addLog(`Updating order ${order_id} in DB...`);
        const { data: order, error: updateError } = await supabase
            .from('orders')
            .update({
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature,
                payment_status: payment.status === 'captured' ? 'paid' : 'pending',
                paid_amount: (Number(payment.amount) || 0) / 100,
                status: payment.status === 'captured' ? 'confirmed' : 'pending'
            })
            .eq('id', order_id)
            .select('*')
            .single();

        if (updateError) {
            addLog(`Error: DB Update failed: ${updateError.message}`);
            return res.status(500).json({ 
                success: false, 
                error: `Order update failed: ${updateError.message}`, 
                diagnostics,
                details: updateError
            });
        }
        addLog('Order updated successfully.');

        // 4. Fetch order items
        addLog('Fetching order items...');
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);

        if (itemsError) {
            addLog(`Warning: Items fetch failed: ${itemsError.message}`);
        } else {
            addLog(`Fetched ${orderItems?.length || 0} items.`);
        }

        // 5. Stock deduction logic (wrapped to not crash)
        if (payment.status === 'captured' && orderItems) {
            addLog('Starting stock deduction...');
            try {
                for (const item of orderItems) {
                    addLog(`Deducting stock for item ${item.product_id}...`);
                    if (item.selected_variant) {
                        const { error: rpcError } = await supabase.rpc('deduct_variant_stock', {
                            variant_id: item.selected_variant.id,
                            qty: item.quantity
                        });
                        if (rpcError) addLog(`RPC Error (Variant): ${rpcError.message}`);
                    } else {
                        const { error: rpcError } = await supabase.rpc('deduct_product_stock', {
                            prod_id: item.product_id,
                            qty: item.quantity
                        });
                        if (rpcError) addLog(`RPC Error (Product): ${rpcError.message}`);
                    }
                }
                addLog('Stock deduction complete.');

                // Clear cart
                addLog('Clearing cart...');
                const { data: cart } = await supabase
                    .from('carts')
                    .select('id')
                    .eq('user_id', userId)
                    .single();

                if (cart) {
                    await supabase.from('cart_items').delete().eq('cart_id', cart.id);
                    addLog('Cart cleared.');
                }
            } catch (stockError: any) {
                addLog(`Exception in stock logic: ${stockError.message}`);
            }
        }

        addLog('Verification process complete.');
        res.json({
            success: true,
            orderId: order.id,
            paymentStatus: payment.status,
            message: 'Payment verified successfully',
            diagnostics
        });

    } catch (error: any) {
        addLog(`CRITICAL ERROR: ${error.message}`);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Unexpected error', 
            diagnostics 
        });
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
