// Razorpay Payment Service for Frontend

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, any>;
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

/**
 * Load Razorpay checkout script
 */
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        // Check if already loaded
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

/**
 * Open Razorpay checkout modal
 */
export const openRazorpayCheckout = async (options: RazorpayOptions): Promise<void> => {
    const isLoaded = await loadRazorpayScript();

    if (!isLoaded) {
        throw new Error('Failed to load Razorpay SDK');
    }

    const razorpay = new window.Razorpay(options);
    razorpay.open();
};

/**
 * Create Razorpay payment with default options
 */
export const createRazorpayPayment = async (params: {
    keyId: string;
    orderId: string;
    amount: number;
    currency?: string;
    customerName?: string;
    customerEmail?: string;
    customerContact?: string;
    onSuccess: (response: RazorpayResponse) => void;
    onFailure?: (error: any) => void;
    onDismiss?: () => void;
}): Promise<void> => {
    const options: RazorpayOptions = {
        key: params.keyId,
        amount: params.amount,
        currency: params.currency || 'INR',
        name: 'Gascart',
        description: 'Industrial Equipment Purchase',
        order_id: params.orderId,
        handler: params.onSuccess,
        prefill: {
            name: params.customerName,
            email: params.customerEmail,
            contact: params.customerContact,
        },
        theme: {
            color: '#3B82F6', // primary-600 color
        },
        modal: {
            ondismiss: params.onDismiss,
        },
    };

    try {
        await openRazorpayCheckout(options);
    } catch (error) {
        console.error('Razorpay payment error:', error);
        if (params.onFailure) {
            params.onFailure(error);
        }
    }
};

export default {
    loadRazorpayScript,
    openRazorpayCheckout,
    createRazorpayPayment,
};
