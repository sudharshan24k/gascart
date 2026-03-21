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
                        ? { ...i, quantity: (Number(i.quantity) || 0) + (Number(action.payload.quantity) || 1) }
                        : i
                );
            } else {
                newItems = [...state.items, { ...action.payload, quantity: Number(action.payload.quantity) || 1 }];
            }
            
            const newTotal = newItems.reduce((acc, item) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 0;
                return acc + (price * qty);
            }, 0);

            return {
                ...state,
                items: newItems,
                total: newTotal,
            };
        }
        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(i => i.id !== action.payload);
            const newTotal = newItems.reduce((acc, item) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 0;
                return acc + (price * qty);
            }, 0);

            return {
                ...state,
                items: newItems,
                total: newTotal,
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
        console.log('[EnquiryContext] Initializing state from localStorage...');
        try {
            const storedState = localStorage.getItem('gascart_enquiry_state');
            if (storedState) {
                const parsed = JSON.parse(storedState);
                
                // Validate parsed structure
                if (parsed && Array.isArray(parsed.items)) {
                    console.log('[EnquiryContext] Successfully loaded items:', parsed.items.length);
                    return {
                        items: parsed.items || [],
                        comparisonItems: parsed.comparisonItems || [],
                        total: Number(parsed.total) || 0
                    };
                }
                console.warn('[EnquiryContext] Stored state invalid structure:', parsed);
            }
        } catch (e) {
            console.error('[EnquiryContext] Failed to parse localStorage state:', e);
        }
        
        console.log('[EnquiryContext] Initializing with empty state');
        return {
            items: [],
            comparisonItems: [],
            total: 0
        };
    });

    // Save state to localStorage whenever it changes
    useEffect(() => {
        console.log('[EnquiryContext] State updated, saving to localStorage:', state);
        try {
            localStorage.setItem('gascart_enquiry_state', JSON.stringify(state));
        } catch (e) {
            console.error('[EnquiryContext] Failed to save enquiry state to localStorage', e);
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
