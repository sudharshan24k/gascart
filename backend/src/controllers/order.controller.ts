import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Helper to get User ID safely
const getUserId = (req: Request) => (req as any).user.id;

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { shipping_address, billing_address, payment_method } = req.body;

        // 1. Get Cart
        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('*, cart_items(*, product:products(*))') // Fetch items and product details (price)
            .eq('user_id', userId)
            .single();

        if (cartError || !cart || !cart.cart_items || cart.cart_items.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'Cart is empty' });
        }

        // 2. Calculate Total (Server side verification)
        // 2. Calculate Total (Server side verification)
        const total_amount = cart.cart_items.reduce((sum: number, item: any) => {
            const variantPrice = item.selected_variant?.price;
            const finalPrice = variantPrice !== undefined ? variantPrice : item.product.price;
            return sum + (item.quantity * finalPrice);
        }, 0);

        // 3. Create Order (Using RPC or sequential inserts - Supabase RPC is best for transaction but we'll do sequential for now if RPC not set up, but we assume no race condition for MVP single user session)
        // Ideally we wrap this in a postgres transaction function, but for Node logic:

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                total_amount,
                shipping_address,
                billing_address: billing_address || shipping_address, // Default to shipping
                status: 'pending',
                payment_status: 'unpaid' // In real app, we mark paid after Stripe webhook
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 4. Create Order Items
        // 4. Create Order Items
        const orderItems = cart.cart_items.map((item: any) => {
            // If variant has specific price, use it. Otherwise use product base price.
            // Assuming variant object has 'price' key if it overrides.
            const variantPrice = item.selected_variant?.price;
            const finalPrice = variantPrice !== undefined ? variantPrice : item.product.price;

            return {
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: finalPrice,
                selected_variant: item.selected_variant // Copy the snapshot
            };
        });

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 5. Clear Cart (Delete Cart Items)
        // We delete items, keeping the empty cart shell or delete cart entirely?
        // Usually we delete items.
        const { error: clearCartError } = await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id);

        if (clearCartError) throw clearCartError;

        res.status(201).json({
            status: 'success',
            data: {
                order_id: order.id
            }
        });

    } catch (err) {
        next(err);
    }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req);
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, image))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ status: 'success', results: data.length, data });
    } catch (err) {
        next(err);
    }
};

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*, profiles:user_id(full_name, email), order_items(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ status: 'success', results: data.length, data });
    } catch (err) {
        next(err);
    }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, payment_status } = req.body;

        const updates: any = {};
        if (status) updates.status = status;
        if (payment_status) updates.payment_status = payment_status;

        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
