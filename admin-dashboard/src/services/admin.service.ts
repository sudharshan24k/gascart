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
