import axios from 'axios';
import { supabase } from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create a central axios instance
const adminApi = axios.create({
    baseURL: API_URL
});

// Add a request interceptor to automatically add the auth header
adminApi.interceptors.request.use(async (config) => {
    try {
        const isHardcodedAdmin = localStorage.getItem('admin_logged_in') === 'true';
        if (isHardcodedAdmin) {
            config.headers.Authorization = 'Bearer development-token';
            return config;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            config.headers.Authorization = `Bearer ${session.access_token}`;
        }
    } catch (error) {
        console.error('[AdminAPI] Interceptor error:', error);
    }
    return config;
});

export const getDashboardStats = async () => {
    const response = await adminApi.get('/admin/stats');
    return response.data.data;
};

export const fetchConsultants = async (params?: { status?: string; is_visible?: boolean }) => {
    const response = await adminApi.get('/consultants', { params });
    return response.data.data;
};

export const updateConsultantStatus = async (id: string, updates: { status?: string; is_visible?: boolean }) => {
    const response = await adminApi.patch(`/consultants/${id}`, updates);
    return response.data.data;
};

export const deleteConsultant = async (id: string) => {
    const response = await adminApi.delete(`/consultants/${id}`);
    return response.data;
};

// Product management
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

// RFQ Management
export const fetchRFQs = async () => {
    const response = await adminApi.get('/rfqs/all');
    return response.data.data;
};

export const updateAdminRFQStatus = async (id: string, status: string) => {
    const response = await adminApi.patch(`/rfqs/${id}/status`, { status });
    return response.data.data;
};

// Category Management
export const fetchCategories = async () => {
    const response = await adminApi.get('/categories');
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

// Knowledge Hub / Articles
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

// Vendor Management
export const fetchVendors = async (params?: { visibility_status?: string }) => {
    const response = await adminApi.get('/vendors', { params });
    return response.data.data;
};

export const fetchVendorEnquiries = async (params?: { status?: string }) => {
    const response = await adminApi.get('/vendors/enquiries', { params });
    return response.data.data;
};

export const updateVendorEnquiryStatus = async (id: string, status: string) => {
    const response = await adminApi.patch(`/vendors/enquiries/${id}`, { status });
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

export const assignVendorToProduct = async (product_id: string, vendor_id: string) => {
    const response = await adminApi.post('/vendors/assign', { product_id, vendor_id });
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

// Document Management
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

// Order Management
export const fetchOrders = async (params?: { status?: string }) => {
    const response = await adminApi.get('/orders/admin/all', { params });
    return response.data.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
    const response = await adminApi.patch(`/orders/admin/${id}/status`, { status });
    return response.data.data;
};

export const updateTracking = async (id: string, carrier: string, tracking_number: string) => {
    const response = await adminApi.patch(`/orders/admin/${id}/tracking`, { carrier, tracking_number });
    return response.data.data;
};

export const updateProductInventory = async (id: string, updates: { adjustment?: number; absolute?: number; low_stock_threshold?: number }) => {
    const response = await adminApi.patch(`/products/${id}/inventory`, updates);
    return response.data.data;
};

export const getOrderInvoiceUrl = (id: string) => {
    return `${API_URL}/orders/${id}/invoice`;
};

export const getExportOrdersUrl = () => {
    return `${API_URL}/orders/admin/export`;
};

export const downloadRFQs = async () => {
    const response = await adminApi.get('/rfqs/export', {
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
// User Management
export const fetchAllUsers = async () => {
    const response = await adminApi.get('/admin/users');
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

