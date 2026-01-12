import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';

// Helper to get or create cart
const getOrCreateCart = async (userId: string | undefined, sessionId: string | undefined) => {
    if (!userId && !sessionId) throw new Error('User ID or Session ID required');

    let query = supabase.from('carts').select('id');
    if (userId) query = query.eq('user_id', userId);
    else query = query.eq('session_id', sessionId);

    const { data: existingCart } = await query.single();

    if (existingCart) return existingCart.id;

    // Create new
    const { data: newCart, error } = await supabase
        .from('carts')
        .insert([{ user_id: userId, session_id: sessionId }])
        .select('id')
        .single();

    if (error) throw error;
    return newCart.id;
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] as string; // Client generated UUID

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'Session ID or Login required' });
        }

        const cartId = await getOrCreateCart(userId, sessionId);

        // Check if item exists
        const { data: existingItem } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .single();

        if (existingItem) {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + quantity })
                .eq('id', existingItem.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('cart_items')
                .insert([{ cart_id: cartId, product_id: productId, quantity }]);
            if (error) throw error;
        }

        res.json({ status: 'success', message: 'Item added to cart' });
    } catch (err) {
        next(err);
    }
};

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] as string;

        let query = supabase.from('carts').select('*, cart_items(*, product:products(*))');

        if (userId) query = query.eq('user_id', userId);
        else if (sessionId) query = query.eq('session_id', sessionId);
        else return res.status(400).json({ message: 'Identification required' });

        const { data, error } = await query.single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returns"

        res.json({ status: 'success', data: data || { cart_items: [] } });
    } catch (err) {
        next(err);
    }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] as string;

        // Verify cart ownership (optional strict check, RLS handles mostly but good for hygiene)
        // For query simplicity, strict RLS is enough or we check parent cart.
        // Direct update on cart_items requires knowing the item ID.

        const { data, error } = await supabase
            .from('cart_items')
            .update({ quantity })
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;

        res.json({ status: 'success', message: 'Cart updated', data });
    } catch (err) {
        next(err);
    }
};

export const removeCartItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { itemId } = req.params;

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        res.json({ status: 'success', message: 'Item removed from cart' });
    } catch (err) {
        next(err);
    }
};
