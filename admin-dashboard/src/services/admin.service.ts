import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const getAuthHeader = () => {
    const token = localStorage.getItem('supabase.auth.token'); // Adjust based on how token is stored
    return {
        Authorization: `Bearer ${token}`
    };
};

export const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}/admin/stats`, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const fetchConsultants = async (params?: { status?: string; is_visible?: boolean }) => {
    const response = await axios.get(`${API_URL}/consultants`, {
        params,
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateConsultantStatus = async (id: string, updates: { status?: string; is_visible?: boolean }) => {
    const response = await axios.patch(`${API_URL}/consultants/${id}`, updates, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const deleteConsultant = async (id: string) => {
    const response = await axios.delete(`${API_URL}/consultants/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Product management
export const fetchAdminProducts = async () => {
    const response = await axios.get(`${API_URL}/products`); // Products are public but we might want admin specific ones later
    return response.data.data;
};

export const addProduct = async (productData: any) => {
    const response = await axios.post(`${API_URL}/products`, productData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateProduct = async (id: string, productData: any) => {
    const response = await axios.put(`${API_URL}/products/${id}`, productData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const deleteProduct = async (id: string) => {
    const response = await axios.delete(`${API_URL}/products/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// RFQ Management
export const fetchRFQs = async () => {
    const response = await axios.get(`${API_URL}/rfqs/all`, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateAdminRFQStatus = async (id: string, status: string) => {
    const response = await axios.patch(`${API_URL}/rfqs/${id}/status`, { status }, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

// Category Management
export const fetchCategories = async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data.data;
};

export const addCategory = async (categoryData: any) => {
    const response = await axios.post(`${API_URL}/categories`, categoryData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
    const response = await axios.patch(`${API_URL}/categories/${id}`, categoryData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const deleteCategory = async (id: string) => {
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Knowledge Hub / Articles
export const fetchAdminArticles = async () => {
    const response = await axios.get(`${API_URL}/articles`);
    return response.data.data;
};

export const addArticle = async (articleData: any) => {
    const response = await axios.post(`${API_URL}/articles`, articleData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateArticle = async (id: string, articleData: any) => {
    const response = await axios.patch(`${API_URL}/articles/${id}`, articleData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const deleteArticle = async (id: string) => {
    const response = await axios.delete(`${API_URL}/articles/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Vendor Management
export const fetchVendors = async (params?: { visibility_status?: string }) => {
    const response = await axios.get(`${API_URL}/vendors`, {
        params,
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const fetchVendorEnquiries = async (params?: { status?: string }) => {
    const response = await axios.get(`${API_URL}/vendors/enquiries`, {
        params,
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateVendorEnquiryStatus = async (id: string, status: string) => {
    const response = await axios.patch(`${API_URL}/vendors/enquiries/${id}`, { status }, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const createVendor = async (vendorData: any) => {
    const response = await axios.post(`${API_URL}/vendors`, vendorData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateVendor = async (id: string, vendorData: any) => {
    const response = await axios.put(`${API_URL}/vendors/${id}`, vendorData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const deleteVendor = async (id: string) => {
    const response = await axios.delete(`${API_URL}/vendors/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

export const assignVendorToProduct = async (product_id: string, vendor_id: string) => {
    const response = await axios.post(`${API_URL}/vendors/assign`, { product_id, vendor_id }, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const removeVendorFromProduct = async (product_id: string, vendor_id: string) => {
    const response = await axios.delete(`${API_URL}/vendors/assign`, {
        data: { product_id, vendor_id },
        headers: getAuthHeader()
    });
    return response.data;
};

export const fetchProductVendors = async (productId: string) => {
    const response = await axios.get(`${API_URL}/vendors/product/${productId}`, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

// Document Management
export const fetchDocuments = async (params?: { category?: string; status?: string }) => {
    const response = await axios.get(`${API_URL}/documents`, {
        params,
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const createDocument = async (documentData: any) => {
    const response = await axios.post(`${API_URL}/documents`, documentData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateDocument = async (id: string, documentData: any) => {
    const response = await axios.put(`${API_URL}/documents/${id}`, documentData, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const deleteDocument = async (id: string) => {
    const response = await axios.delete(`${API_URL}/documents/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};

// Order Management
export const fetchOrders = async (params?: { status?: string }) => {
    const response = await axios.get(`${API_URL}/orders/admin/all`, {
        params,
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateOrderStatus = async (id: string, status: string) => {
    const response = await axios.patch(`${API_URL}/orders/admin/${id}/status`, { status }, {
        headers: getAuthHeader()
    });
    return response.data.data;
};

export const updateProductInventory = async (id: string, adjustment: number) => {
    const response = await axios.patch(`${API_URL}/products/${id}/inventory`, { adjustment }, {
        headers: getAuthHeader()
    });
    return response.data.data;
};
