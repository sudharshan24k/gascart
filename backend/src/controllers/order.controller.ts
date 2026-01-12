import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { items, shippingAddress, billingAddress, totalAmount } = req.body;

        if (!userId) return res.status(401).json({ message: 'User must be logged in to checkout' });

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: userId,
                total_amount: totalAmount,
                shipping_address: shippingAddress,
                billing_address: billingAddress,
                status: 'pending'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Add Items
        const orderItems = items.map((item: any) => ({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price_at_purchase: item.product.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        res.status(201).json({ status: 'success', data: order });
    } catch (err) {
        next(err);
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*, product:products(*))')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
// Admin: Get all orders
export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { status } = req.query;
        let query = supabase
            .from('orders')
            .select('*, order_items(*, product:products(name, price)), profiles:user_id(full_name, email)')
            .order('created_at', { ascending: false });

        if (status && status !== 'All') {
            query = query.eq('status', (status as string).toLowerCase());
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};

// Admin: Update order status
export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};
