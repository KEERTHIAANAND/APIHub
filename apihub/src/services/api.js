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

// User Dashboard API
export const userAPI = {
    getStats: () => apiRequest('/user/stats'),
    getApiKeys: () => apiRequest('/user/api-keys'),
    createApiKey: (data) => apiRequest('/user/api-keys', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    revokeApiKey: (keyId) => apiRequest(`/user/api-keys/${keyId}`, {
        method: 'DELETE'
    }),
    getTraceHistory: () => apiRequest('/user/trace-history')
};

// Admin API
export const adminAPI = {
    // Overview
    getOverview: () => apiRequest('/admin/overview'),

    // Endpoints
    getEndpoints: () => apiRequest('/admin/endpoints'),
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

    // Datasets
    getDatasets: () => apiRequest('/admin/datasets'),
    uploadDataset: (formData) => fetch(`${API_URL}/admin/datasets/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData // FormData for file upload
    }).then(res => res.json()),
    deleteDataset: (id) => apiRequest(`/admin/datasets/${id}`, {
        method: 'DELETE'
    }),

    // Access Keys
    getAccessKeys: () => apiRequest('/admin/access-keys'),
    generateAccessKey: (data) => apiRequest('/admin/access-keys/generate', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    revokeAccessKey: (id) => apiRequest(`/admin/access-keys/${id}/revoke`, {
        method: 'PATCH'
    }),
    regenerateAccessKey: (id) => apiRequest(`/admin/access-keys/${id}/regenerate`, {
        method: 'PATCH'
    }),

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
