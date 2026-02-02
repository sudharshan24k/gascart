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

// Inventory Management
export const updateInventory = async (productId: string, data: {
    adjustment?: number;
    absolute?: number;
    low_stock_threshold?: number;
    warehouse_location?: string;
    notes?: string;
}) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    const apiUrl = getBaseUrl();
    const res = await fetch(`${apiUrl}/products/${productId}/inventory`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const bulkUpdateInventory = async (updates: Array<{
    productId: string;
    adjustment?: number;
    absolute?: number;
    low_stock_threshold?: number;
}>) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) throw new Error('Not authenticated');

    // Execute updates in parallel
    const promises = updates.map(update =>
        updateInventory(update.productId, update)
    );
    return Promise.all(promises);
};

export const getInventoryReport = async () => {
    const products = await fetchAdminProducts();

    const totalProducts = products.length;
    const inStock = products.filter((p: any) => (p.stock_quantity || 0) > (p.low_stock_threshold || 10)).length;
    const lowStock = products.filter((p: any) => {
        const stock = p.stock_quantity || 0;
        const threshold = p.low_stock_threshold || 10;
        return stock > 0 && stock <= threshold;
    }).length;
    const outOfStock = products.filter((p: any) => (p.stock_quantity || 0) === 0).length;
    const totalValue = products.reduce((sum: number, p: any) => sum + ((p.stock_quantity || 0) * (p.price || 0)), 0);

    return {
        totalProducts,
        inStock,
        lowStock,
        outOfStock,
        totalValue,
        products
    };
};

