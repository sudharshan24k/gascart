import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 0, // 0 will let the OS assign an available port if not specified
    supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_ANON_KEY || '',
    },
    env: process.env.NODE_ENV || 'development'
};
