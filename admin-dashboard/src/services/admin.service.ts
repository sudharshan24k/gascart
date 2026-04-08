import axios, { AxiosRequestConfig } from 'axios';
import { supabase } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create a central axios instance
const adminApi = axios.create({
    baseURL: API_URL
});

/**
 * Reliably retrieves the current Supabase access token.
 *
 * Problem: When using sessionStorage as the auth storage, Supabase's
 * getSession() can return null on the very first call right after page load,
 * even when a valid session exists in sessionStorage. This is because Supabase
 * hydrates its internal session state asynchronously. Instead of waiting for
 * the SIGNED_IN event, we proactively call refreshSession() to force immediate
 * hydration, then fall back to getUser() (which validates the token server-side).
 *
 * This eliminates the 401 race condition on every admin page.
 */
const getAccessToken = async (): Promise<string | null> => {
    // First try — fast path, works most of the time
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) return session.access_token;

    // Second try — session not yet hydrated from sessionStorage; force refresh.
    // This exchanges the stored refresh token for a new access token.
    try {
        const { data: { session: refreshed } } = await supabase.auth.refreshSession();
        if (refreshed?.access_token) return refreshed.access_token;
    } catch (_) {
        // refreshSession() throws if there is no refresh token at all —
        // that's fine, it means the user is genuinely not logged in.
    }

    // Third try — last resort: validate via server round-trip
    try {
        const { data: { session: userSession } } = await supabase.auth.getSession();
        if (userSession?.access_token) return userSession.access_token;
    } catch (_) { /* ignore */ }

    return null;
};

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the auth token to every request. Uses the multi-step getAccessToken()
// helper to survive the Supabase session hydration race on first page load.
adminApi.interceptors.request.use(async (config) => {
    try {
        const token = await getAccessToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.debug(`[AdminAPI] Auth token attached to ${config.url}`);
        } else {
            console.warn(`[AdminAPI] No session found for ${config.url}`);
        }
        config.headers['x-admin-request'] = 'true';
    } catch (error) {
        console.error('[AdminAPI] Interceptor error:', error);
    }
    return config;
});

// ─── Response Interceptor: Retry on 401 ──────────────────────────────────────
// If a request gets a 401 (token expired mid-session), automatically refresh
// the token once and retry the request before propagating the error.
adminApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retried) {
            originalRequest._retried = true;
            try {
                const { data: { session } } = await supabase.auth.refreshSession();
                if (session?.access_token) {
                    originalRequest.headers['Authorization'] = `Bearer ${session.access_token}`;
                    return adminApi(originalRequest);
                }
            } catch (_) { /* refresh failed — propagate original 401 */ }
        }
        return Promise.reject(error);
    }
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getDashboardStats = async () => {
    const response = await adminApi.get('/admin/stats');
    return response.data.data;
};

// ─── Consultants ──────────────────────────────────────────────────────────────
export const fetchConsultants = async (params?: { status?: string; is_visible?: boolean }) => {
    const response = await adminApi.get('/consultants', { params });
    return response.data.data;
};

export const updateConsultantStatus = async (id: string, updates: { status?: string; is_visible?: boolean; contract_start_date?: string | null; contract_expiry_date?: string | null;[key: string]: any }) => {
    const response = await adminApi.patch(`/consultants/${id}`, updates);
    return response.data.data;
};

export const deleteConsultant = async (id: string) => {
    const response = await adminApi.delete(`/consultants/${id}`);
    return response.data;
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const fetchAdminProducts = async () => {
    const response = await adminApi.get('/products');
    return response.data.data;
};

export const addProduct = async (productData: any) => {
    const response = await adminApi.post('/products', productData);
    return response.data.data;
};

export const updateProduct = async (id: string, productData: any) => {
    const response = await adminApi.put(`/products/${id}`, productData);
    return response.data.data;
};

export const deleteProduct = async (id: string) => {
    const response = await adminApi.delete(`/products/${id}`);
    return response.data;
};

// ─── RFQs ─────────────────────────────────────────────────────────────────────
export const fetchRFQs = async () => {
    const response = await adminApi.get('/rfqs/all');
    return response.data.data;
};

export const updateAdminRFQStatus = async (id: string, status?: string, internal_comments?: string) => {
    const response = await adminApi.patch(`/rfqs/${id}/status`, { status, internal_comments });
    return response.data.data;
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const fetchCategories = async (status: string = 'active') => {
    const response = await adminApi.get('/categories', { params: { status } });
    return response.data.data;
};

export const addCategory = async (categoryData: any) => {
    const response = await adminApi.post('/categories', categoryData);
    return response.data.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
    const response = await adminApi.patch(`/categories/${id}`, categoryData);
    return response.data.data;
};

export const deleteCategory = async (id: string) => {
    const response = await adminApi.delete(`/categories/${id}`);
    return response.data;
};

export const permanentlyDeleteCategory = async (id: string) => {
    const response = await adminApi.delete(`/categories/${id}/permanent`);
    return response.data;
};

// ─── Knowledge Hub / Articles ─────────────────────────────────────────────────
export const fetchAdminArticles = async () => {
    const response = await adminApi.get('/articles');
    return response.data.data;
};

export const addArticle = async (articleData: any) => {
    const response = await adminApi.post('/articles', articleData);
    return response.data.data;
};

export const updateArticle = async (id: string, articleData: any) => {
    const response = await adminApi.patch(`/articles/${id}`, articleData);
    return response.data.data;
};

export const deleteArticle = async (id: string) => {
    const response = await adminApi.delete(`/articles/${id}`);
    return response.data;
};

// ─── Vendors ──────────────────────────────────────────────────────────────────
export const fetchVendors = async (params?: { visibility_status?: string }) => {
    const response = await adminApi.get('/vendors', { params });
    return response.data.data;
};

export const fetchVendorEnquiries = async (params?: { status?: string }) => {
    const response = await adminApi.get('/vendors/enquiries', { params });
    return response.data.data;
};

export const updateVendorEnquiryStatus = async (id: string, status?: string, internal_comments?: string) => {
    const response = await adminApi.patch(`/vendors/enquiries/${id}`, { status, internal_comments });
    return response.data.data;
};

export const createVendor = async (vendorData: any) => {
    const response = await adminApi.post('/vendors', vendorData);
    return response.data.data;
};

export const updateVendor = async (id: string, vendorData: any) => {
    const response = await adminApi.put(`/vendors/${id}`, vendorData);
    return response.data.data;
};

export const deleteVendor = async (id: string) => {
    const response = await adminApi.delete(`/vendors/${id}`);
    return response.data;
};

export const assignVendorToProduct = async (
    product_id: string,
    vendor_id: string,
    vendorData?: {
        vendor_sku?: string;
        vendor_price?: number;
        vendor_stock_quantity?: number;
        vendor_lead_time_days?: number;
        vendor_specifications?: any;
        is_primary?: boolean;
        priority?: number;
    }
) => {
    const response = await adminApi.post('/vendors/assign', {
        product_id,
        vendor_id,
        ...vendorData
    });
    return response.data.data;
};

export const updateProductVendor = async (
    product_id: string,
    vendor_id: string,
    updates: {
        vendor_sku?: string;
        vendor_price?: number;
        vendor_stock_quantity?: number;
        vendor_lead_time_days?: number;
        vendor_specifications?: any;
        is_primary?: boolean;
        priority?: number;
        is_active?: boolean;
    }
) => {
    const response = await adminApi.put('/vendors/assign', {
        product_id,
        vendor_id,
        ...updates
    });
    return response.data.data;
};

export const removeVendorFromProduct = async (product_id: string, vendor_id: string) => {
    const response = await adminApi.delete('/vendors/assign', {
        data: { product_id, vendor_id }
    });
    return response.data;
};

export const fetchProductVendors = async (productId: string) => {
    const response = await adminApi.get(`/vendors/product/${productId}`);
    return response.data.data;
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const fetchDocuments = async (params?: { category?: string; status?: string }) => {
    const response = await adminApi.get('/documents', { params });
    return response.data.data;
};

export const createDocument = async (documentData: any) => {
    const response = await adminApi.post('/documents', documentData);
    return response.data.data;
};

export const updateDocument = async (id: string, documentData: any) => {
    const response = await adminApi.put(`/documents/${id}`, documentData);
    return response.data.data;
};

export const deleteDocument = async (id: string) => {
    const response = await adminApi.delete(`/documents/${id}`);
    return response.data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const fetchOrders = async (params?: { status?: string }) => {
    const response = await adminApi.get('/orders/admin/all', { params });
    return response.data.data;
};

export const updateOrderStatus = async (id: string, updates: { 
    status?: string; 
    payment_status?: string; 
    paid_amount?: number; 
    balance_due?: number; 
    internal_comments?: string;
}) => {
    const response = await adminApi.patch(`/orders/admin/${id}/status`, updates);
    return response.data.data;
};

export const updateTracking = async (id: string, carrier: string, tracking_number: string) => {
    const response = await adminApi.patch(`/orders/admin/${id}/tracking`, { carrier, tracking_number });
    return response.data.data;
};

export const updateProductInventory = async (id: string, updates: { adjustment?: number; absolute?: number; low_stock_threshold?: number; variants?: any[]; warehouse_location?: string }) => {
    const response = await adminApi.patch(`/products/${id}/inventory`, updates);
    return response.data.data;
};

export const getOrderInvoiceUrl = (id: string) => {
    return `${API_URL}/orders/${id}/invoice`;
};

export const getExportOrdersUrl = () => {
    return `${API_URL}/orders/admin/export`;
};

/**
 * Downloads an authenticated resource as a blob.
 * Used for invoice downloads that require Bearer token (not possible via plain <a href>).
 */
export const downloadAuthenticatedFile = async (url: string): Promise<Blob> => {
    const token = await getAccessToken();
    const response = await fetch(url, {
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'x-admin-request': 'true',
        }
    });
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    return response.blob();
};

export const downloadRFQs = async () => {
    const response = await adminApi.get('/rfqs/export', {
        responseType: 'blob'
    });
    return response.data;
};

export const downloadRFQsPDF = async () => {
    const response = await adminApi.get('/rfqs/export/pdf', {
        responseType: 'blob'
    });
    return response.data;
};

export const downloadInquiriesPDF = async (params?: any) => {
    const response = await adminApi.get('/consultants/inquiries/export/pdf', {
        params,
        responseType: 'blob'
    });
    return response.data;
};

export const downloadOrders = async () => {
    const response = await adminApi.get('/orders/admin/export', {
        responseType: 'blob'
    });
    return response.data;
};

// ─── User Management ──────────────────────────────────────────────────────────
export const fetchAllUsers = async (params?: { role?: string; account_status?: string }) => {
    const response = await adminApi.get('/admin/users', { params });
    return response.data.data;
};

export const fetchUserOrders = async (userId: string) => {
    const response = await adminApi.get(`/admin/users/${userId}/orders`);
    return response.data.data;
};

export const updateUser = async (userId: string, updates: any) => {
    const response = await adminApi.patch(`/admin/users/${userId}`, updates);
    return response.data.data;
};

export const exportUsersCSV = async (selectedIds?: string[]) => {
    const response = await adminApi.post('/admin/users/export', { userIds: selectedIds }, {
        responseType: 'blob'
    });
    return response.data;
};

export const exportInvoicesZIP = async (orderIds: string[]) => {
    const response = await adminApi.post('/admin/orders/export-invoices', { orderIds }, {
        responseType: 'blob'
    });
    return response.data;
};

// ─── File Upload ──────────────────────────────────────────────────────────────
export const uploadFile = async (bucket: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await adminApi.post(`/upload/${bucket}`, formData);
    return response.data.data;
};

export const removeFile = async (bucket: string, filename: string) => {
    const response = await adminApi.delete(`/upload/${bucket}`, {
        data: { path: filename }
    });
    return response.data;
};

export const renameFile = async (bucket: string, oldPath: string, newPath: string) => {
    const response = await adminApi.post(`/upload/${bucket}/rename`, {
        oldPath,
        newPath
    });
    return response.data;
};

export const listBucketFiles = async (bucket: string) => {
    const response = await adminApi.get(`/upload/${bucket}/files`);
    return response.data;
};

// ─── Career Applications ──────────────────────────────────────────────────────
export const getCareerApplications = async (params?: { category?: string; status?: string }) => {
    const response = await adminApi.get('/admin/careers', { params });
    return response.data;
};

export const updateCareerApplicationStatus = async (id: string, status?: string, old_status?: string, internal_comments?: string) => {
    const response = await adminApi.patch(`/admin/careers/${id}/status`, { status, old_status, internal_comments });
    return response.data;
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = async (params?: {
    action?: string;
    entity_type?: string;
    target_type?: string;
    entity_id?: string;
    target_id?: string;
    entity_label?: string;
    actor_id?: string;
    actor_email?: string;
    search?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
}) => {
    const response = await adminApi.get('/admin/audit-logs', { params });
    return response.data; // Returns { status, total, results, data }
};

export const getResumeSignedUrl = async (path: string) => {
    const response = await adminApi.post('/admin/careers/signed-url', { path });
    return response.data;
};

// ─── Admin Management ─────────────────────────────────────────────────────────
export const createAdmin = async (adminData: { email: string; full_name: string; password?: string; permissions: string[] }) => {
    const response = await adminApi.post('/admin/users/create-admin', adminData);
    return response.data.data;
};

export const deleteAdmin = async (userId: string) => {
    const response = await adminApi.delete(`/admin/users/${userId}`);
    return response.data;
};

/**
 * Logs an auth event (LOGIN / LOGOUT) to the audit trail.
 *
 * @param token - Optional pre-fetched access token. Pass this when logging
 *   LOGOUT so the token is captured BEFORE sign-out clears the session.
 *   Without it, the async interceptor may race against sign-out and get null.
 */
export const logAuthEvent = async (
    action: 'LOGIN' | 'LOGOUT',
    description: string,
    metadata: any = {},
    token?: string
) => {
    const overrideConfig: AxiosRequestConfig = token
        ? { headers: { Authorization: `Bearer ${token}`, 'x-admin-request': 'true' } }
        : {};

    const response = await adminApi.post('/admin/audit/log-auth', {
        action,
        description,
        metadata
    }, overrideConfig);
    return response.data;
};
