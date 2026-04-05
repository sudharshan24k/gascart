import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api'; // Ensure this path is correct
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface CartItem {
    id: string; // cart_item_id
    product_id: string;
    product: {
        id: string;
        name: string;
        price: number;
        image_url?: string;
        sku?: string;
        advance_payment_percentage?: number;
    };
    quantity: number;
    selected_variant?: any;
    vendor_id?: string;
    vendor_price?: number;
    vendor_sku?: string;
    vendor_name?: string;
}

interface CartContextType {
    items: CartItem[];
    cartTotal: number;
    addToCart: (productId: string, quantity?: number, variant?: any, vendor?: any) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Manage Session ID for guests
    const [sessionId] = useState(() => {
        const stored = localStorage.getItem('gascart_session_id');
        if (stored) return stored;
        const newId = uuidv4();
        localStorage.setItem('gascart_session_id', newId);
        return newId;
    });

    const token = session?.access_token || null;

    const fetchCart = async () => {
        try {
            console.log('[CartContext] Fetching cart...', { token, sessionId });
            setLoading(true);
            const res = await api.cart.get(token, sessionId);
            console.log('[CartContext] Get Cart response:', res);
            if (res.status === 'success' && res.data) {
                console.log('[CartContext] Setting items:', res.data.cart_items);
                setItems(res.data.cart_items || []);
            }
        } catch (err) {
            console.error('[CartContext] Failed to fetch cart', err);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when auth changes (guest -> user merge logic could be handled by backend here)
    useEffect(() => {
        fetchCart();
    }, [token, sessionId]);

    const addToCart = async (productId: string, quantity = 1, variant?: any, vendor?: any) => {
        try {
            const vendorData = vendor ? {
                vendor_id: vendor.vendor_id,
                vendor_price: vendor.vendor_price,
                vendor_sku: vendor.vendor_sku
            } : undefined;

            await api.cart.add(token, sessionId, { productId, quantity, variant, ...vendorData });
            await fetchCart(); // Refresh to get full product details
        } catch (err) {
            console.error('Add to cart failed', err);
            throw err;
        }
    };

    const updateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        try {
            // Optimistic update
            setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));

            await api.cart.update(token, sessionId, itemId, quantity);
        } catch (err) {
            console.error('Update quantity failed', err);
            await fetchCart(); // Revert on error
        }
    };

    const removeFromCart = async (itemId: string) => {
        try {
            setItems(prev => prev.filter(item => item.id !== itemId));
            await api.cart.remove(token, sessionId, itemId);
        } catch (err) {
            console.error('Remove item failed', err);
            await fetchCart();
        }
    };

    const clearCart = async () => {
        try {
            setItems([]);
            await api.cart.clear(token, sessionId);
        } catch (err) {
            console.error('Clear cart failed', err);
            await fetchCart();
        }
    };

    const cartTotal = items.reduce((sum, item) => {
        const price = item.vendor_price
            ?? item.selected_variant?.price
            ?? item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ items, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
