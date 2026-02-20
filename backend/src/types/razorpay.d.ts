declare module 'razorpay' {
    interface RazorpayOptions {
        key_id: string;
        key_secret: string;
        headers?: Record<string, string>;
    }

    interface Orders {
        create(options: {
            amount: number;
            currency: string;
            receipt?: string;
            notes?: Record<string, string | number | undefined>; // Allow undefined
            payment_capture?: boolean | 0 | 1;
        }): Promise<any>;
        fetch(orderId: string): Promise<any>;
    }

    interface Payments {
        fetch(paymentId: string): Promise<any>;
        capture(paymentId: string, amount: number, currency: string): Promise<any>;
        refund(paymentId: string, options?: { amount?: number; speed?: 'normal' | 'optimum'; notes?: Record<string, string>; receipt?: string }): Promise<any>;
    }

    class Razorpay {
        constructor(options: RazorpayOptions);
        orders: Orders;
        payments: Payments;
        static validateWebhookSignature(
            body: string,
            signature: string,
            secret: string
        ): boolean;
    }

    export = Razorpay;
}
