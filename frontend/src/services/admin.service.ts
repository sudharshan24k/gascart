import { supabase } from './api';

const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const fetchAdminProducts = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const apiUrl = getBaseUrl();
    const res = await fetch(`${apiUrl}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await res.json();
    return result.status === 'success' ? result.data : result;
};

export const addProduct = async (data: any) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const apiUrl = getBaseUrl();
    const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const updateProduct = async (id: string, data: any) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const apiUrl = getBaseUrl();
    const res = await fetch(`${apiUrl}/products/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const deleteProduct = async (id: string) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const apiUrl = getBaseUrl();
    const res = await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.json();
};
