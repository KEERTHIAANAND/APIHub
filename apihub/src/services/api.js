// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API requests
const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data;
};

// Auth API
export const authAPI = {
    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    login: (credentials) => apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    firebaseAuth: (idToken) => apiRequest('/auth/firebase', {
        method: 'POST',
        body: JSON.stringify({ idToken })
    }),

    getMe: () => apiRequest('/auth/me'),

    logout: () => apiRequest('/auth/logout', { method: 'POST' }),

    // Make first user admin (one-time setup)
    makeAdmin: () => apiRequest('/auth/make-admin', { method: 'POST' })
};

// Developer Dashboard API (for non-admin users)
export const developerAPI = {
    // Get my assigned API keys
    getMyApiKeys: () => apiRequest('/developer/api-keys'),

    // Get my usage stats
    getMyStats: () => apiRequest('/developer/stats'),

    // Get my request history
    getMyHistory: (params = {}) => apiRequest(`/developer/history?${new URLSearchParams(params)}`),

    // Get available endpoints for my keys
    getMyEndpoints: () => apiRequest('/developer/endpoints'),

    // Clear request history
    clearHistory: () => apiRequest('/developer/history', { method: 'DELETE' })
};

// Admin API
export const adminAPI = {
    // Dashboard Stats
    getDashboardStats: () => apiRequest('/admin/dashboard-stats'),

    // Overview
    getOverview: () => apiRequest('/admin/overview'),

    // Endpoints
    getEndpoints: () => apiRequest('/admin/endpoints'),
    getEndpoint: (id) => apiRequest(`/admin/endpoints/${id}`),
    createEndpoint: (data) => apiRequest('/admin/endpoints', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateEndpoint: (id, data) => apiRequest(`/admin/endpoints/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteEndpoint: (id) => apiRequest(`/admin/endpoints/${id}`, {
        method: 'DELETE'
    }),
    toggleEndpoint: (id) => apiRequest(`/admin/endpoints/${id}/toggle`, {
        method: 'PATCH'
    }),
    testEndpoint: (id, params) => apiRequest(`/admin/endpoints/${id}/test?${new URLSearchParams(params)}`),

    // Datasets
    getDatasets: () => apiRequest('/admin/datasets'),
    getDataset: (id) => apiRequest(`/admin/datasets/${id}`),
    getDatasetData: (id, params) => apiRequest(`/admin/datasets/${id}/data?${new URLSearchParams(params)}`),
    createDataset: (data) => apiRequest('/admin/datasets', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    uploadDataset: (formData) => fetch(`${API_URL}/admin/datasets/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData // FormData for file upload
    }).then(res => res.json()),
    updateDataset: (id, data) => apiRequest(`/admin/datasets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    deleteDataset: (id) => apiRequest(`/admin/datasets/${id}`, {
        method: 'DELETE'
    }),

    // Access Keys
    getAccessKeys: () => apiRequest('/admin/access-keys'),
    getAccessKey: (id) => apiRequest(`/admin/access-keys/${id}`),
    generateAccessKey: (data) => apiRequest('/admin/access-keys/generate', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateAccessKey: (id, data) => apiRequest(`/admin/access-keys/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    revokeAccessKey: (id) => apiRequest(`/admin/access-keys/${id}/revoke`, {
        method: 'PATCH'
    }),
    regenerateAccessKey: (id) => apiRequest(`/admin/access-keys/${id}/regenerate`, {
        method: 'PATCH'
    }),
    deleteAccessKey: (id) => apiRequest(`/admin/access-keys/${id}`, {
        method: 'DELETE'
    }),
    getAvailableUsers: () => apiRequest('/admin/access-keys/users'),

    // Audit Logs
    getAuditLogs: () => apiRequest('/admin/audit-logs'),

    // User Management
    getUsers: () => apiRequest('/admin/users'),
    getUser: (userId) => apiRequest(`/admin/users/${userId}`),
    setUserRole: (userId, role) => apiRequest(`/admin/users/${userId}/role`, {
        method: 'POST',
        body: JSON.stringify({ role })
    }),
    deleteUser: (userId) => apiRequest(`/admin/users/${userId}`, {
        method: 'DELETE'
    })
};

export default apiRequest;
