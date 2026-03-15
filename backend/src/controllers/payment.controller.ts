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

        // Calculate totals (must match frontend: subtotal + 18% tax = grandTotal, 50% advance)
        const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.price) * Number(item.quantity)), 0);
        
        if (isNaN(subtotal) || subtotal <= 0) {
            console.error('[PaymentController] Invalid subtotal calculated:', subtotal, items);
            return res.status(400).json({ error: 'Invalid checkout amount' });
        }

        const tax = subtotal * 0.18;
        const totalAmount = subtotal + tax;          // Grand total (tax-inclusive) — matches frontend
        const advanceAmount = totalAmount * 0.5;     // 50% advance
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
 * Bulletproof Verify Payment
 */
export const verifyPayment = async (req: AuthRequest, res: Response) => {
    const diagnostics: string[] = [];
    const addLog = (msg: string) => {
        const timestamp = new Date().toISOString();
        diagnostics.push(`[${timestamp}] ${msg}`);
        console.log(`[PaymentVerify] ${msg}`);
    };

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
        const userId = req.user?.id;

        addLog(`Initiating verification for Order: ${order_id}, User: ${userId}`);

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
            addLog('Missing Parameters: ' + JSON.stringify({ 
                hasOrder: !!order_id, 
                hasRzpOrder: !!razorpay_order_id, 
                hasRzpPayment: !!razorpay_payment_id, 
                hasSignature: !!razorpay_signature 
            }));
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required payment details', 
                diagnostics 
            });
        }

        // 1. Signature Verification
        addLog('Step 1: Checking Signature...');
        if (!config.razorpay.keySecret) {
            addLog('CRITICAL: RAZORPAY_KEY_SECRET is missing from environment!');
            throw new Error('Server configuration error: Razorpay secret missing');
        }

        const isValid = verifyPaymentSignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            addLog('FAIL: Signature Mismatch');
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid payment signature', 
                diagnostics 
            });
        }
        addLog('SUCCESS: Signature Verified');

        // 2. Razorpay Status Fetch
        addLog('Step 2: Fetching payment from Razorpay...');
        const paymentResult = await getPaymentDetails(razorpay_payment_id);
        if (!paymentResult.success || !paymentResult.payment) {
            addLog(`FAIL: Razorpay Fetch - ${paymentResult.error}`);
            return res.status(400).json({ 
                success: false, 
                error: `Razorpay Error: ${paymentResult.error}`, 
                diagnostics 
            });
        }
        const payment = paymentResult.payment;
        addLog(`SUCCESS: Payment Status is [${payment.status}]`);

        // 3. Database Update (Bypassing RLS with service role if possible)
        addLog('Step 3: Updating order in database...');
        
        // Note: The 'supabase' client exported in config/supabase already tries to use serviceKey
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
            addLog(`FAIL: DB Update - ${updateError.message} (${updateError.code})`);
            addLog(`HINT: ${updateError.hint || 'No hint'}`);
            return res.status(500).json({ 
                success: false, 
                error: `Database Error: ${updateError.message}`, 
                diagnostics,
                db_code: updateError.code
            });
        }
        addLog('SUCCESS: Database Order Updated');

        // 4. Post-Update Tasks (Stock following, clearing cart)
        addLog('Step 4: Running post-payment logic...');
        try {
            // Fetch items
            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            if (itemsError) {
                addLog(`Warning: Failed to fetch order items - ${itemsError.message}`);
            } else if (payment.status === 'captured' && items) {
                addLog(`Deducting stock for ${items.length} items...`);
                for (const item of items) {
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
                addLog('Stock deduction complete.');

                // Clear cart only if this is a logged in user
                if (userId) {
                    const { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).single();
                    if (cart) {
                        await supabase.from('cart_items').delete().eq('cart_id', cart.id);
                        addLog('User cart cleared.');
                    }
                }
            }
        } catch (postError: any) {
            addLog(`Warning: Post-payment logic error (Non-fatal) - ${postError.message}`);
        }

        addLog('Verification Finished Successfully');
        return res.json({
            success: true,
            orderId: order.id,
            paymentStatus: payment.status,
            diagnostics
        });

    } catch (error: any) {
        const stack = error.stack?.split('\n').slice(0, 3).join(' | ');
        addLog(`CRITICAL CRASH: ${error.message} (Stack: ${stack})`);
        return res.status(500).json({ 
            success: false, 
            error: error.message || 'Unknown internal crash', 
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
