import { createClient } from '@supabase/supabase-js';

// These should be in env vars, but for now using placeholders or relying on .env
// Vite exposes env vars via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Supabase URL or Key missing in frontend environment. Check your .env file or Vercel project settings.');
}

// Fallback to empty string or dummy value to prevent "URL required" error crashing the app immediately
// This allows the app to load even if broken, so usage can see console errors
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
);

export const api = {
    products: {
        list: async (params: Record<string, string>) => {
            // Call backend API or Supabase directly. 
            // For this architecture, let's assume we call our Node backend to abstraction logic
            // OR specific requirements said "Supabase" but "Node.js with Express" backend.
            // Usually usage is: Frontend -> Node Backend -> Supabase (for custom logic) 
            // OR Frontend -> Supabase (for simple CRUD). 
            // Given the "Bespoke platform" and "Backend Folder Structure", we should prefer the Node Backend.
            const query = new URLSearchParams(params).toString();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/products?${query}`);
            return res.json();
        },
        get: async (id: string) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/products/${id}`);
            return res.json();
        }
    },
    cart: {
        add: async (token: string, data: { productId: string; quantity: number }) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/cart`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        }
    }
};
