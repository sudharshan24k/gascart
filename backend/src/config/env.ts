import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_ANON_KEY || '',
    },
    env: process.env.NODE_ENV || 'development'
};
