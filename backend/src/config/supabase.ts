import { createClient } from '@supabase/supabase-js';
import { config } from './env';

if (!config.supabase.url || !config.supabase.key) {
    console.warn('Supabase URL or Key is missing. Database connection may fail.');
} else {
    console.log('[SupabaseConfig] URL:', config.supabase.url);
    if (config.supabase.serviceKey) {
        console.log('[SupabaseConfig] Using Service Role Key (RLS Bypass enabled)');
    } else {
        console.warn('[SupabaseConfig] Using Anon Key (RLS will be active)');
    }
}

export const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceKey || config.supabase.key
);
