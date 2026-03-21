import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';

// Helper to get or create cart
const getOrCreateCart = async (userId: string | undefined, sessionId: string | undefined) => {
    if (!userId && !sessionId) throw new Error('User ID or Session ID required');

    let query = supabase.from('carts').select('id');
    if (userId) query = query.eq('user_id', userId);
    else query = query.eq('session_id', sessionId);

    const { data: existingCarts } = await query;
    if (existingCarts && existingCarts.length > 0) return existingCarts[0].id;

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
        const { productId, quantity, variant, vendor_id, vendor_price, vendor_sku } = req.body;
        const userId = req.user?.id;
        const sessionId = req.headers['x-session-id'] as string; // Client generated UUID

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'Session ID or Login required' });
        }

        const cartId = await getOrCreateCart(userId, sessionId);

        // Check if item exists (Same Product AND Same Variant AND Same Vendor)
        let query = supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cartId)
            .eq('product_id', productId);

        if (variant) {
            query = query.contains('selected_variant', variant);
        } else {
            query = query.is('selected_variant', null);
        }

        if (vendor_id) {
            query = query.eq('vendor_id', vendor_id);
        } else {
            query = query.is('vendor_id', null);
        }

        const { data: existingItems } = await query;
        const existingItem = existingItems && existingItems.length > 0 ? existingItems[0] : null;

        if (existingItem) {
            const { error } = await supabase
                .from('cart_items')
                .update({ quantity: existingItem.quantity + quantity })
                .eq('id', existingItem.id);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('cart_items')
                .insert([{
                    cart_id: cartId,
                    product_id: productId,
                    quantity,
                    selected_variant: variant || null,
                    vendor_id: vendor_id || null,
                    vendor_price: vendor_price || null,
                    vendor_sku: vendor_sku || null
                }]);
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

        // Auto-merge guest cart with user cart if both are provided
        if (userId && sessionId) {
            console.log(`[CartController] Attempting merge for User: ${userId}, Session: ${sessionId}`);
            // Find guest cart (not yet associated with a user)
            const { data: sessionCart } = await supabase
                .from('carts')
                .select('id')
                .eq('session_id', sessionId)
                .is('user_id', null)
                .maybeSingle();

            if (sessionCart) {
                console.log(`[CartController] Found session cart: ${sessionCart.id}`);
                // Find or create user cart
                let { data: userCart } = await supabase
                    .from('carts')
                    .select('id')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (userCart) {
                    console.log(`[CartController] Merging into existing user cart: ${userCart.id}`);
                    // Fetch all items from session cart
                    const { data: sessionItems } = await supabase
                        .from('cart_items')
                        .select('*')
                        .eq('cart_id', sessionCart.id);

                    if (sessionItems && sessionItems.length > 0) {
                        for (const item of sessionItems) {
                            // Check if equivalent item exists in user cart
                            let checkQuery = supabase.from('cart_items')
                                .select('id, quantity')
                                .eq('cart_id', userCart.id)
                                .eq('product_id', item.product_id);
                            
                            if (item.selected_variant) checkQuery = checkQuery.eq('selected_variant', item.selected_variant);
                            else checkQuery = checkQuery.is('selected_variant', null);
                            
                            if (item.vendor_id) checkQuery = checkQuery.eq('vendor_id', item.vendor_id);
                            else checkQuery = checkQuery.is('vendor_id', null);

                            const { data: existingItems } = await checkQuery;
                            const existing = existingItems && existingItems.length > 0 ? existingItems[0] : null;

                            if (existing) {
                                // Update quantity and delete guest item
                                await supabase.from('cart_items')
                                    .update({ quantity: existing.quantity + item.quantity })
                                    .eq('id', existing.id);
                                await supabase.from('cart_items').delete().eq('id', item.id);
                            } else {
                                // Move guest item to user cart
                                await supabase.from('cart_items')
                                    .update({ cart_id: userCart.id })
                                    .eq('id', item.id);
                            }
                        }
                    }
                    // Delete the now-empty session cart
                    await supabase.from('carts').delete().eq('id', sessionCart.id);
                } else {
                    console.log(`[CartController] No user cart found, promoting session cart to user cart`);
                    // Just associate the session cart with the user
                    await supabase.from('carts')
                        .update({ user_id: userId })
                        .eq('id', sessionCart.id);
                }
            }
        }

        let query = supabase.from('carts').select('*, cart_items(*, product:products(*))');

        if (userId) query = query.eq('user_id', userId);
        else if (sessionId) query = query.eq('session_id', sessionId);
        else return res.status(400).json({ message: 'Identification required' });

        const { data, error } = await query;

        if (error) throw error;

        res.json({ status: 'success', data: data && data.length > 0 ? data[0] : { cart_items: [] } });
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
