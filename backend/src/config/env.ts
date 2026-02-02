import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 0, // 0 will let the OS assign an available port if not specified
    supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_ANON_KEY || '',
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    },
    env: process.env.NODE_ENV || 'development',
    razorpay: {
        keyId: process.env.RAZORPAY_KEY_ID || '',
        keySecret: process.env.RAZORPAY_KEY_SECRET || '',
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    },
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

