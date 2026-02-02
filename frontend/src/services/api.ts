import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        storage: window.sessionStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

const getBaseUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const api = {
    products: {
        list: async (params: Record<string, string>) => {
            const query = new URLSearchParams(params).toString();
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/products?${query}`);
            return res.json();
        },
        get: async (id: string) => {
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/products/${id}`);
            return res.json();
        },
        create: async (token: string, data: any) => {
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
        }
    },
    cart: {
        get: async (token: string | null, sessionId: string) => {
            const apiUrl = getBaseUrl();
            const headers: any = { 'x-session-id': sessionId };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/cart`, { headers });
            return res.json();
        },
        add: async (token: string | null, sessionId: string, data: { productId: string; quantity: number, variant?: any }) => {
            const apiUrl = getBaseUrl();
            const headers: any = {
                'x-session-id': sessionId,
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/cart/items`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data)
            });
            return res.json();
        },
        update: async (token: string | null, sessionId: string, itemId: string, quantity: number) => {
            const apiUrl = getBaseUrl();
            const headers: any = {
                'x-session-id': sessionId,
                'Content-Type': 'application/json'
            };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/cart/items/${itemId}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ quantity })
            });
            return res.json();
        },
        remove: async (token: string | null, sessionId: string, itemId: string) => {
            const apiUrl = getBaseUrl();
            const headers: any = { 'x-session-id': sessionId };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${apiUrl}/cart/items/${itemId}`, {
                method: 'DELETE',
                headers
            });
            return res.json();
        }
    },
    orders: {
        create: async (data: any) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        list: async () => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        },
        get: async (id: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/orders/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        },
        cancel: async (id: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/orders/${id}/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        },
        getInvoiceUrl: (id: string) => {
            const apiUrl = getBaseUrl();
            return `${apiUrl}/orders/${id}/invoice`;
        }
    },
    rfqs: {
        submit: async (token: string, data: any) => {
            const apiUrl = getBaseUrl();
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
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/rfqs/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        }
    },
    users: {
        getProfile: async () => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        },
        updateProfile: async (data: { full_name?: string; phone?: string }) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        addresses: {
            list: async () => {
                const token = (await supabase.auth.getSession()).data.session?.access_token;
                if (!token) throw new Error('Not authenticated');
                const apiUrl = getBaseUrl();
                const res = await fetch(`${apiUrl}/users/addresses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return res.json();
            },
            add: async (data: any) => {
                const token = (await supabase.auth.getSession()).data.session?.access_token;
                if (!token) throw new Error('Not authenticated');
                const apiUrl = getBaseUrl();
                const res = await fetch(`${apiUrl}/users/addresses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
                return res.json();
            },
            update: async (id: string, data: any) => {
                const token = (await supabase.auth.getSession()).data.session?.access_token;
                if (!token) throw new Error('Not authenticated');
                const apiUrl = getBaseUrl();
                const res = await fetch(`${apiUrl}/users/addresses/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
                return res.json();
            },
            delete: async (id: string) => {
                const token = (await supabase.auth.getSession()).data.session?.access_token;
                if (!token) throw new Error('Not authenticated');
                const apiUrl = getBaseUrl();
                const res = await fetch(`${apiUrl}/users/addresses/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                return res.json();
            }
        }
    },
    vendors: {
        submitEnquiry: async (data: any) => {
            const apiUrl = getBaseUrl();
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
        },
        getEnquiries: async (status?: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const query = status ? `?status=${status}` : '';
            const res = await fetch(`${apiUrl}/vendors/enquiries${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch enquiries');
            return res.json();
        },
        updateEnquiryStatus: async (id: string, status: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/vendors/enquiries/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        list: async (visibility_status?: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const query = visibility_status ? `?visibility_status=${visibility_status}` : '';
            const res = await fetch(`${apiUrl}/vendors${query}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        },
        update: async (id: string, data: any) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/vendors/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        getProductVendors: async (productId: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/vendors/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        },
        assignProduct: async (data: any) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/vendors/products/assign`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        updateProductVendor: async (productId: string, vendorId: string, data: any) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/vendors/products/update`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: productId, vendor_id: vendorId, ...data })
            });
            return res.json();
        },
        removeProductVendor: async (productId: string, vendorId: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/vendors/products/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ product_id: productId, vendor_id: vendorId })
            });
            return res.json();
        }
    },
    admin: {
        updateUser: async (userId: string, data: { role?: string, account_status?: string }) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        getUsers: async () => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/admin/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        }
    },
    documents: {
        list: async () => {
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/documents`);
            return res.json();
        }
    },
    articles: {
        list: async (params: Record<string, string>) => {
            const query = new URLSearchParams(params).toString();
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/articles?${query}`);
            return res.json();
        },
        get: async (slug: string) => {
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/articles/${slug}`);
            return res.json();
        }
    },
    consultants: {
        register: async (data: any) => {
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/consultants/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        list: async (params: Record<string, string> = {}) => {
            const query = new URLSearchParams(params).toString();
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/consultants?${query}`);
            return res.json();
        },
        get: async (id: string) => {
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/consultants/${id}`);
            return res.json();
        },
        getMyProfile: async () => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/consultants/my-profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        }
    },
    categories: {
        list: async () => {
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/categories`);
            return res.json();
        }
    },
    payments: {
        createOrder: async (data: { items: any[], shippingDetails: any, billingDetails: any }) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        verifyPayment: async (data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, order_id: string }) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/payments/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            return res.json();
        },
        getPaymentStatus: async (paymentId: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/payments/status/${paymentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        },
        getSessionStatus: async (sessionId: string) => {
            const token = (await supabase.auth.getSession()).data.session?.access_token;
            if (!token) throw new Error('Not authenticated');
            const apiUrl = getBaseUrl();
            const res = await fetch(`${apiUrl}/payments/session/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.json();
        }
    }
};

