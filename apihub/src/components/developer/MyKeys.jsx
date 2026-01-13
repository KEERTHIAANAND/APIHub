import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const MyKeys = () => {
    const {
        apiKeys,
        copiedKey,
        copyToClipboard,
        setSelectedKey,
        setShowEndpointsModal,
        getMethodColor
    } = useOutletContext();

    const [searchQuery, setSearchQuery] = useState('');

    const filteredKeys = apiKeys.filter(key =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.keyPrefix?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatUsage = (usage) => {
        if (usage >= 1000000) return (usage / 1000000).toFixed(1) + 'M';
        if (usage >= 1000) return Math.floor(usage / 1000) + 'K';
        return usage?.toString() || '0';
    };

    return (
        <div className="p-6 flex-1 overflow-auto">
            {/* Search Bar */}
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
                <span className="text-sm text-gray-500">{filteredKeys.length} keys available</span>
            </div>

            {/* API Keys Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredKeys.map(key => (
                    <div
                        key={key._id}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">{key.name}</h3>
                                <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${key.status === 'active'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    <span className={`w-1 h-1 rounded-full ${key.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {key.status}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {key.description && (
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{key.description}</p>
                        )}

                        {/* Key Display */}
                        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg px-3 py-2">
                            <code className="text-xs text-gray-600 font-mono flex-1 truncate">
                                {key.keyPrefix}•••••••••••••
                            </code>
                            <button
                                onClick={() => copyToClipboard(key.fullKey || key.keyPrefix, key._id)}
                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors bg-transparent border-none cursor-pointer"
                                title="Copy full API key"
                            >
                                {copiedKey === key._id ? (
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

                        {/* Endpoints Access + View Button */}
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div>
                                <span className="font-medium">Access:</span>{' '}
                                {key.accessLevel === 'all' ? (
                                    <span className="text-blue-600">All endpoints</span>
                                ) : (
                                    <span>{key.endpoints?.length || 0} endpoints</span>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedKey(key);
                                    setShowEndpointsModal(true);
                                }}
                                className="text-blue-500 hover:text-blue-600 bg-transparent border-none cursor-pointer text-xs font-medium"
                            >
                                View Endpoints →
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <div>
                                <span className="font-medium">Usage:</span> {formatUsage(key.totalUsage)}
                            </div>
                            <div>
                                <span className="font-medium">Rate:</span> {key.rateLimit}/hr
                            </div>
                            <div>
                                <span className="font-medium">Created:</span> {new Date(key.createdAt).toLocaleDateString()}
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
                            {searchQuery ? 'Try adjusting your search query' : 'No API keys are available yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyKeys;
