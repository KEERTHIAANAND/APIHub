import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AccessKeys = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showNewKeyModal, setShowNewKeyModal] = useState(false);
    const [newlyGeneratedKey, setNewlyGeneratedKey] = useState(null);
    const [copiedKeyId, setCopiedKeyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [endpoints, setEndpoints] = useState([]);
    const [apiKeys, setApiKeys] = useState([]);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        accessLevel: 'all',
        endpoints: [],
        rateLimit: 1000,
        assignedTo: ''
    });

    // Fetch API keys and endpoints on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [keysRes, endpointsRes, usersRes] = await Promise.all([
                adminAPI.getAccessKeys(),
                adminAPI.getEndpoints(),
                adminAPI.getAvailableUsers()
            ]);

            if (keysRes.success) {
                setApiKeys(keysRes.apiKeys);
            }
            if (endpointsRes.success) {
                setEndpoints(endpointsRes.endpoints);
            }
            if (usersRes.success) {
                setUsers(usersRes.users);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Filter keys based on search query
    const filteredKeys = apiKeys.filter(key =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.keyPrefix.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopyKey = async (keyId, keyText) => {
        try {
            await navigator.clipboard.writeText(keyText);
            setCopiedKeyId(keyId);
            setTimeout(() => setCopiedKeyId(null), 2000);
        } catch (err) {
            console.error('Failed to copy key:', err);
        }
    };

    const handleRegenerateKey = async (keyId) => {
        if (!confirm('Are you sure? This will invalidate the old key.')) return;

        try {
            const response = await adminAPI.regenerateAccessKey(keyId);
            if (response.success) {
                setNewlyGeneratedKey(response.apiKey.key);
                setShowNewKeyModal(true);
                await fetchData();
            } else {
                alert(response.error || 'Failed to regenerate key');
            }
        } catch (err) {
            alert(err.message || 'Failed to regenerate key');
        }
    };

    const handleRevokeKey = async (keyId) => {
        try {
            const response = await adminAPI.revokeAccessKey(keyId);
            if (response.success) {
                await fetchData();
            } else {
                alert(response.error || 'Failed to revoke key');
            }
        } catch (err) {
            alert(err.message || 'Failed to revoke key');
        }
    };

    const handleDeleteKey = async (keyId) => {
        if (!confirm('Are you sure you want to delete this API key?')) return;

        try {
            const response = await adminAPI.deleteAccessKey(keyId);
            if (response.success) {
                await fetchData();
            } else {
                alert(response.error || 'Failed to delete key');
            }
        } catch (err) {
            alert(err.message || 'Failed to delete key');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEndpointToggle = (endpointId) => {
        setFormData(prev => {
            const newEndpoints = prev.endpoints.includes(endpointId)
                ? prev.endpoints.filter(id => id !== endpointId)
                : [...prev.endpoints, endpointId];
            return { ...prev, endpoints: newEndpoints };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await adminAPI.generateAccessKey({
                name: formData.name,
                description: formData.description,
                accessLevel: formData.accessLevel,
                endpoints: formData.accessLevel === 'specific' ? formData.endpoints : [],
                rateLimit: parseInt(formData.rateLimit),
                assignedTo: formData.assignedTo || null
            });

            if (response.success) {
                // Show the newly generated key
                setNewlyGeneratedKey(response.apiKey.key);
                handleCloseModal();
                setShowNewKeyModal(true);
                await fetchData();
            } else {
                setError(response.error || 'Failed to generate key');
            }
        } catch (err) {
            setError(err.message || 'Failed to generate key');
        } finally {
            setSaving(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            name: '',
            description: '',
            accessLevel: 'all',
            endpoints: [],
            rateLimit: 1000,
            assignedTo: ''
        });
    };

    const formatUsage = (usage) => {
        if (usage >= 1000000) {
            return (usage / 1000000).toFixed(1) + 'M';
        } else if (usage >= 1000) {
            return Math.floor(usage / 1000) + 'K';
        }
        return usage.toString();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading API keys...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto p-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search API keys..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 border-none rounded-lg text-white text-xs font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                    Generate API Key
                </button>
            </div>

            {/* API Keys Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredKeys.map((apiKey) => (
                    <div
                        key={apiKey._id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{apiKey.name}</h3>
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${apiKey.status === 'active'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    <span className={`w-1 h-1 rounded-full ${apiKey.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {apiKey.status}
                                </span>
                            </div>
                        </div>

                        {/* Key Display */}
                        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg px-3 py-2">
                            <code className="text-xs text-gray-600 font-mono flex-1 truncate">
                                {apiKey.keyPrefix}•••••••••••••
                            </code>
                            <button
                                onClick={() => handleCopyKey(apiKey._id, apiKey.keyPrefix)}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer"
                                title="Copy key prefix"
                            >
                                {copiedKeyId === apiKey._id ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Endpoints */}
                        <div className="text-xs text-gray-500 mb-3">
                            <span className="font-medium">Access:</span>{' '}
                            {apiKey.accessLevel === 'all' ? (
                                <span className="text-blue-600">All endpoints</span>
                            ) : (
                                <span>{apiKey.endpoints?.length || 0} endpoints</span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                            <div>
                                <span className="font-medium">Usage:</span> {formatUsage(apiKey.totalUsage)}
                            </div>
                            <div>
                                <span className="font-medium">Created:</span> {formatDate(apiKey.createdAt)}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRegenerateKey(apiKey._id)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all bg-transparent border-none cursor-pointer"
                                    title="Regenerate key"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 4v6h-6"></path>
                                        <path d="M1 20v-6h6"></path>
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                    </svg>
                                    Regenerate
                                </button>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleRevokeKey(apiKey._id)}
                                    className={`px-2 py-1 text-xs rounded transition-all border-none cursor-pointer ${apiKey.status === 'active'
                                        ? 'text-orange-600 hover:bg-orange-50'
                                        : 'text-green-600 hover:bg-green-50'
                                        } bg-transparent`}
                                >
                                    {apiKey.status === 'active' ? 'Revoke' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => handleDeleteKey(apiKey._id)}
                                    className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-all bg-transparent border-none cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredKeys.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                        <p className="text-lg font-medium text-gray-500">No API keys found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchQuery ? 'Try adjusting your search query' : 'Generate your first API key to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* Generate API Key Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-10">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Generate API Key</h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Key Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Key Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Production Key"
                                    required
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief description"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* Access Level */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Access Level
                                </label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="accessLevel"
                                            value="all"
                                            checked={formData.accessLevel === 'all'}
                                            onChange={handleInputChange}
                                            className="text-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">All endpoints</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="accessLevel"
                                            value="specific"
                                            checked={formData.accessLevel === 'specific'}
                                            onChange={handleInputChange}
                                            className="text-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Specific endpoints</span>
                                    </label>
                                </div>
                            </div>

                            {/* Endpoint Selection (if specific) */}
                            {formData.accessLevel === 'specific' && (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        Select Endpoints
                                    </label>
                                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                                        {endpoints.length === 0 ? (
                                            <p className="text-sm text-gray-400 p-2">No endpoints available. Create endpoints first.</p>
                                        ) : (
                                            endpoints.map(endpoint => (
                                                <label
                                                    key={endpoint._id}
                                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.endpoints.includes(endpoint._id)}
                                                        onChange={() => handleEndpointToggle(endpoint._id)}
                                                        className="text-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{endpoint.name}</span>
                                                    <code className="text-xs text-gray-400">{endpoint.path}</code>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Rate Limit */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Rate Limit (requests/hour)
                                </label>
                                <input
                                    type="number"
                                    name="rateLimit"
                                    value={formData.rateLimit}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {error && (
                                <div className="text-sm text-red-500">{error}</div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !formData.name}
                                    className="px-6 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm disabled:opacity-50"
                                >
                                    {saving ? 'Generating...' : 'Generate Key'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* New Key Generated Modal */}
            {showNewKeyModal && newlyGeneratedKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-10 p-6">
                        <div className="text-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900">API Key Generated!</h2>
                            <p className="text-sm text-gray-500 mt-1">Copy this key now. You won't be able to see it again.</p>
                        </div>

                        <div className="bg-gray-900 rounded-lg p-4 mb-4">
                            <code className="text-sm text-green-400 font-mono break-all">{newlyGeneratedKey}</code>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(newlyGeneratedKey);
                                    setCopiedKeyId('new');
                                    setTimeout(() => setCopiedKeyId(null), 2000);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer hover:bg-blue-600"
                            >
                                {copiedKeyId === 'new' ? (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                        Copy Key
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowNewKeyModal(false);
                                    setNewlyGeneratedKey(null);
                                }}
                                className="px-4 py-2.5 bg-gray-100 border-none rounded-lg text-gray-700 text-sm font-medium cursor-pointer hover:bg-gray-200"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessKeys;
