import { createClient } from '@supabase/supabase-js';
import { config } from './env';

if (!config.supabase.url || !config.supabase.key) {
    console.warn('Supabase URL or Key is missing. Database connection may fail.');
}

export const supabase = createClient(
    config.supabase.url,
    config.supabase.key
);
