import { useState } from 'react';

const AccessKeys = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [copiedKeyId, setCopiedKeyId] = useState(null);
    const [formData, setFormData] = useState({
        keyName: '',
        dataset: '',
        expiresIn: '30'
    });

    // Access keys data - starts empty, managed via Generate API Key modal
    const [accessKeys, setAccessKeys] = useState([]);

    // Dataset options
    const datasetOptions = [
        { value: '', label: 'Select Dataset' },
        { value: 'product-inventory', label: 'Product Inventory' },
        { value: 'customer-list', label: 'Customer List' },
        { value: 'orders', label: 'Orders' },
        { value: 'analytics', label: 'Analytics' }
    ];

    const expirationOptions = [
        { value: '30', label: '30 days' },
        { value: '60', label: '60 days' },
        { value: '90', label: '90 days' },
        { value: '365', label: '1 year' },
        { value: 'never', label: 'Never expires' }
    ];

    // Filter keys based on search query
    const filteredKeys = accessKeys.filter(key =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.dataset.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCopyKey = async (keyId, fullKey) => {
        try {
            await navigator.clipboard.writeText(fullKey);
            setCopiedKeyId(keyId);
            setTimeout(() => setCopiedKeyId(null), 2000);
        } catch (err) {
            console.error('Failed to copy key:', err);
        }
    };

    const handleRefreshKey = (keyId) => {
        // Regenerate key logic - in real app, this would call an API
        const updatedKeys = accessKeys.map(key => {
            if (key.id === keyId) {
                const newKeyPart = Math.random().toString(36).substring(2, 18);
                return {
                    ...key,
                    fullKey: `${key.key}${newKeyPart}`,
                    lastUsed: 'Just now'
                };
            }
            return key;
        });
        setAccessKeys(updatedKeys);
    };

    const handleRevokeKey = (keyId) => {
        const updatedKeys = accessKeys.map(key => {
            if (key.id === keyId) {
                return {
                    ...key,
                    status: key.status === 'active' ? 'revoked' : 'active'
                };
            }
            return key;
        });
        setAccessKeys(updatedKeys);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const keyPrefix = 'pk_' + formData.keyName.toLowerCase().replace(/\s+/g, '_').substring(0, 4) + '_';
        const keyPart = Math.random().toString(36).substring(2, 18);

        const newKey = {
            id: Date.now(),
            name: formData.keyName,
            key: keyPrefix,
            maskedKey: `${keyPrefix}... •••••••••••••••`,
            fullKey: `${keyPrefix}${keyPart}`,
            status: 'active',
            dataset: datasetOptions.find(d => d.value === formData.dataset)?.label || 'None',
            createdAt: new Date().toISOString().split('T')[0],
            usage: 0,
            lastUsed: 'Never'
        };

        setAccessKeys(prev => [...prev, newKey]);
        setFormData({ keyName: '', dataset: '', expiresIn: '30' });
        setShowModal(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ keyName: '', dataset: '', expiresIn: '30' });
    };

    const formatUsage = (usage) => {
        if (usage >= 1000000) {
            return (usage / 1000000).toFixed(1) + 'M';
        } else if (usage >= 1000) {
            return (usage / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return usage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    return (
        <div className="flex-1 overflow-auto p-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-64">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by owner or key..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 border-none rounded-md text-white text-xs font-medium cursor-pointer transition-all hover:bg-emerald-600 shadow-sm hover:shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Generate API Key
                </button>
            </div>

            {/* Access Keys List */}
            <div className="space-y-3">
                {filteredKeys.map((accessKey) => (
                    <div
                        key={accessKey.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex items-start justify-between">
                            {/* Left Section - Key Details */}
                            <div className="flex-1">
                                {/* Key Name and Status Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-sm font-semibold text-gray-900 m-0">
                                        {accessKey.name}
                                    </h3>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${accessKey.status === 'active'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                        : 'bg-red-50 text-red-600 border border-red-200'
                                        }`}>
                                        {accessKey.status === 'active' ? 'Active' : 'Revoked'}
                                    </span>
                                </div>

                                {/* Masked Key with Copy Button */}
                                <div className="flex items-center gap-1.5 mb-2">
                                    <code className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded font-mono border border-gray-200">
                                        {accessKey.maskedKey}
                                    </code>
                                    <button
                                        onClick={() => handleCopyKey(accessKey.id, accessKey.fullKey)}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all cursor-pointer bg-transparent border-none"
                                        title="Copy API Key"
                                    >
                                        {copiedKeyId === accessKey.id ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Dataset and Created Date */}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <span className="text-gray-400">Dataset:</span>
                                    <span className="text-blue-500 font-medium">{accessKey.dataset}</span>
                                    <span className="mx-1.5 text-gray-300">•</span>
                                    <span className="text-gray-400">Created:</span>
                                    <span className="text-gray-600">{accessKey.createdAt}</span>
                                </div>
                            </div>

                            {/* Right Section - Usage Stats and Actions */}
                            <div className="flex items-center gap-4">
                                {/* Usage Stats */}
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                                        USAGE
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {formatUsage(accessKey.usage)} <span className="text-xs font-normal text-gray-500">reqs</span>
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">
                                        Last used: {accessKey.lastUsed}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1">
                                    {/* Refresh/Regenerate Button */}
                                    <button
                                        onClick={() => handleRefreshKey(accessKey.id)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all cursor-pointer bg-transparent border-none"
                                        title="Regenerate Key"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                                        </svg>
                                    </button>

                                    {/* Revoke/Disable Button */}
                                    <button
                                        onClick={() => handleRevokeKey(accessKey.id)}
                                        className={`p-1.5 rounded transition-all cursor-pointer bg-transparent border-none ${accessKey.status === 'active'
                                            ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                            : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
                                            }`}
                                        title={accessKey.status === 'active' ? 'Revoke Key' : 'Activate Key'}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredKeys.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-white border border-gray-200 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-gray-300">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                        <p className="text-sm font-medium text-gray-500 m-0">No API keys found</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {searchQuery ? 'Try adjusting your search query' : 'Generate your first API key to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* Generate API Key Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal */}
                    <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4 z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                            <h2 className="text-sm font-semibold text-gray-900 m-0">Generate API Key</h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            {/* Key Name */}
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                    Key Name
                                </label>
                                <input
                                    type="text"
                                    name="keyName"
                                    value={formData.keyName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Production Key"
                                    required
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                />
                            </div>

                            {/* Dataset */}
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                    Dataset Access
                                </label>
                                <div className="relative">
                                    <select
                                        name="dataset"
                                        value={formData.dataset}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-xs appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    >
                                        {datasetOptions.map(ds => (
                                            <option key={ds.value} value={ds.value}>{ds.label}</option>
                                        ))}
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>

                            {/* Expiration */}
                            <div>
                                <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                    Expires In
                                </label>
                                <div className="relative">
                                    <select
                                        name="expiresIn"
                                        value={formData.expiresIn}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-xs appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                    >
                                        {expirationOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 text-xs font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-emerald-500 border-none rounded-md text-white text-xs font-medium cursor-pointer transition-all hover:bg-emerald-600 shadow-sm hover:shadow-md"
                                >
                                    Generate Key
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessKeys;
