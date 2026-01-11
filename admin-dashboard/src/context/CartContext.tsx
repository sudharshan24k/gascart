import { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
type CartItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
};

type CartState = {
    items: CartItem[];
    total: number;
};

type CartAction =
    | { type: 'ADD_ITEM'; payload: CartItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'CLEAR_CART' };

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
} | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const existingItem = state.items.find(i => i.id === action.payload.id);
            let newItems;
            if (existingItem) {
                newItems = state.items.map(i =>
                    i.id === action.payload.id
                        ? { ...i, quantity: i.quantity + action.payload.quantity }
                        : i
                );
            } else {
                newItems = [...state.items, action.payload];
            }
            return {
                items: newItems,
                total: newItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
            };
        }
        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(i => i.id !== action.payload);
            return {
                items: newItems,
                total: newItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
            };
        }
        case 'CLEAR_CART':
            return { items: [], total: 0 };
        default:
            return state;
    }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
