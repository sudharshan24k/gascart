import { createClient } from '@supabase/supabase-js';

// These should be in env vars, but for now using placeholders or relying on .env
// Vite exposes env vars via import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase URL or Key missing in frontend environment');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseKey || ''
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
    },
    articles: {
        list: async (params: Record<string, string>) => {
            const query = new URLSearchParams(params).toString();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/articles?${query}`);
            return res.json();
        },
        get: async (slug: string) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/articles/${slug}`);
            return res.json();
        }
    },
    rfqs: {
        submit: async (token: string, data: { product_id: string; submitted_fields: any }) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/rfqs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        my: async (token: string) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/rfqs/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        }
    },
    vendors: {
        submitEnquiry: async (data: {
            company_name: string;
            contact_person: string;
            email: string;
            phone: string;
            business_type: string;
            certifications?: string[];
            message?: string;
        }) => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/vendors/enquiry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to submit enquiry');
            }
            return res.json();
        }
    },
    documents: {
        list: async () => {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
            const res = await fetch(`${apiUrl}/documents`);
            return res.json();
        }
    }
};
