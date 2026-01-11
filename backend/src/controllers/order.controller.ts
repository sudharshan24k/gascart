import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
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

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
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
