import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Industrial Types
export type EnquiryItem = {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    category?: string;
    vendor?: {
        id: string;
        company_name: string;
    } | string;
    attributes?: any;
};

export type ComparisonItem = {
    id: string;
    name: string;
    image?: string;
    category?: string;
    price?: number;
    attributes?: any;
    vendor?: {
        id: string;
        company_name: string;
    } | string;
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
    | { type: 'REMOVE_COMPARISON'; payload: string }
    | { type: 'CLEAR_COMPARISON' };

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

        case 'CLEAR_COMPARISON':
            return { ...state, comparisonItems: [] };

        default:
            return state;
    }
};

export const EnquiryProvider = ({ children }: { children: ReactNode }) => {
    // Lazily initialize state from localStorage
    const [state, dispatch] = useReducer(enquiryReducer, undefined, () => {
        try {
            const storedState = localStorage.getItem('gascart_enquiry_state');
            if (storedState) {
                return JSON.parse(storedState);
            }
        } catch (e) {
            console.error('Failed to load enquiry state from localStorage', e);
        }
        return {
            items: [],
            comparisonItems: [],
            total: 0
        };
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('gascart_enquiry_state', JSON.stringify(state));
        } catch (e) {
            console.error('Failed to save enquiry state to localStorage', e);
        }
    }, [state]);

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
