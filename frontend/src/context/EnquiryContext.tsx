import { createContext, useContext, useReducer, ReactNode } from 'react';

// Industrial Types
export type EnquiryItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    category?: string;
    vendor?: string;
    attributes?: any;
};

export type ComparisonItem = {
    id: string;
    name: string;
    image?: string;
    category?: string;
    attributes?: any;
};

type EnquiryState = {
    items: EnquiryItem[];
    comparisonItems: ComparisonItem[];
    total: number;
};

type EnquiryAction =
    | { type: 'ADD_ITEM'; payload: EnquiryItem }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'CLEAR_ENQUIRY' }
    | { type: 'TOGGLE_COMPARISON'; payload: ComparisonItem }
    | { type: 'REMOVE_COMPARISON'; payload: string };

const EnquiryContext = createContext<{
    state: EnquiryState;
    dispatch: React.Dispatch<EnquiryAction>;
} | undefined>(undefined);

const enquiryReducer = (state: EnquiryState, action: EnquiryAction): EnquiryState => {
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
                ...state,
                items: newItems,
                total: newItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
            };
        }
        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(i => i.id !== action.payload);
            return {
                ...state,
                items: newItems,
                total: newItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
            };
        }
        case 'CLEAR_ENQUIRY':
            return { ...state, items: [], total: 0 };

        case 'TOGGLE_COMPARISON': {
            const exists = state.comparisonItems.find(i => i.id === action.payload.id);
            if (exists) {
                return {
                    ...state,
                    comparisonItems: state.comparisonItems.filter(i => i.id !== action.payload.id)
                };
            }
            // Limit to 4 for UX clarity
            if (state.comparisonItems.length >= 4) return state;

            return {
                ...state,
                comparisonItems: [...state.comparisonItems, action.payload]
            };
        }
        case 'REMOVE_COMPARISON':
            return {
                ...state,
                comparisonItems: state.comparisonItems.filter(i => i.id !== action.payload)
            };

        default:
            return state;
    }
};

export const EnquiryProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(enquiryReducer, {
        items: [],
        comparisonItems: [],
        total: 0
    });

    return (
        <EnquiryContext.Provider value={{ state, dispatch }}>
            {children}
        </EnquiryContext.Provider>
    );
};

export const useEnquiry = () => {
    const context = useContext(EnquiryContext);
    if (!context) throw new Error('useEnquiry must be used within an EnquiryProvider');
    return context;
};
