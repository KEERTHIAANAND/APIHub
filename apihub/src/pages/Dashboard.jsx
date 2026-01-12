import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('console');
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [visibleKeys, setVisibleKeys] = useState({});
    const [copiedKey, setCopiedKey] = useState(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // API keys - will be fetched from backend
    const apiKeys = [];

    const toggleKeyVisibility = (keyId) => {
        setVisibleKeys(prev => ({
            ...prev,
            [keyId]: !prev[keyId]
        }));
    };

    const copyToClipboard = (key, keyId) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Trace history - will be fetched from backend
    const traceHistory = [];

    // Display only 5 recent for main view
    const recentHistory = traceHistory.slice(0, 5);

    const getVerbColor = (verb) => {
        switch (verb) {
            case 'GET': return 'text-blue-500';
            case 'POST': return 'text-green-500';
            case 'PUT': return 'text-amber-500';
            case 'DELETE': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return 'text-green-500';
        if (status >= 400) return 'text-red-500';
        return 'text-gray-500';
    };

    const navItems = [
        { id: 'console', label: 'Console', icon: 'grid' },
        { id: 'keys', label: 'My Keys', icon: 'key' },
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'grid':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                );
            case 'key':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                );
            default:
                return null;
        }
    };

    // Get the title for current active section
    const getPageTitle = () => {
        const item = navItems.find(nav => nav.id === activeTab);
        return item ? item.label : 'Console';
    };

    // Table component to avoid repetition
    const TraceTable = ({ data, compact = false }) => (
        <table className="w-full">
            <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Verb</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lat</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((trace, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className={`px-6 ${compact ? 'py-3' : 'py-4'} text-sm text-gray-600`}>{trace.timestamp}</td>
                        <td className={`px-6 ${compact ? 'py-3' : 'py-4'} text-sm font-semibold ${getVerbColor(trace.verb)}`}>
                            {trace.verb}
                        </td>
                        <td className={`px-6 ${compact ? 'py-3' : 'py-4'} text-sm text-gray-700 font-mono`}>{trace.route}</td>
                        <td className={`px-6 ${compact ? 'py-3' : 'py-4'} text-sm font-medium ${getStatusColor(trace.status)}`}>
                            • {trace.status}
                        </td>
                        <td className={`px-6 ${compact ? 'py-3' : 'py-4'} text-sm text-gray-500`}>{trace.latency}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // My Keys Section Component
    const MyKeysSection = () => (
        <div className="flex-1 p-6 overflow-hidden bg-gray-50/50">

            {/* API Keys List */}
            {apiKeys.length > 0 ? (
                <div className="space-y-3 mb-4">
                    {apiKeys.map((keyItem) => (
                        <div key={keyItem.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-start justify-between">
                                {/* Left Section - Key Info */}
                                <div className="flex-1">
                                    {/* Key Name and Status */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3 className="text-sm font-semibold text-gray-900">{keyItem.name}</h3>
                                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${keyItem.status === 'active'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {keyItem.status.charAt(0).toUpperCase() + keyItem.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Key Input with Actions */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex-1 max-w-sm">
                                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5">
                                                <span className="text-xs text-gray-600 font-mono flex-1">
                                                    {visibleKeys[keyItem.id] ? keyItem.key : keyItem.maskedKey}
                                                </span>
                                                <button
                                                    onClick={() => toggleKeyVisibility(keyItem.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                                                    title={visibleKeys[keyItem.id] ? 'Hide key' : 'Show key'}
                                                >
                                                    {visibleKeys[keyItem.id] ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                            <circle cx="12" cy="12" r="3"></circle>
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(keyItem.key, keyItem.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md transition-all duration-200 hover:bg-gray-50 cursor-pointer"
                                        >
                                            {copiedKey === keyItem.id ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                                    </svg>
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Created and Last Used */}
                                    <p className="text-[10px] text-gray-400">
                                        Created on {keyItem.createdAt} · Last used {keyItem.lastUsed}
                                    </p>
                                </div>

                                {/* Right Section - Usage Stats */}
                                <div className="text-right pl-6">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Total Usage</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {keyItem.totalUsage.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-gray-400">Requests since creation</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl border border-gray-200 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                        <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys Yet</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-md">
                        You haven't created any API keys. API keys allow you to authenticate requests to the API.
                    </p>
                    <p className="text-xs text-gray-400">
                        API key generation will be available soon
                    </p>
                </div>
            )}

            {/* Security Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <h4 className="text-xs font-semibold text-gray-900 mb-0.5">SECURITY NOTE</h4>
                <p className="text-xs text-gray-600">
                    Never share your API keys in <span className="text-red-500">client-side code</span> or <span className="text-red-500">public repositories</span>.
                    If a key is compromised, contact support immediately to have it <span className="text-red-500">revoked</span>.
                </p>
            </div>
        </div>
    );

    // Console Section Component
    const ConsoleSection = () => (
        <div className="flex-1 p-6 overflow-hidden bg-gray-50/50">

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {/* Usage Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-medium">Usage</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-3">0</p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                </div>

                {/* Success Rate Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-medium">Success Rate</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">--</p>
                    <p className="text-xs text-gray-400 font-medium">No requests yet</p>
                </div>

                {/* Active Keys Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-medium">Active Keys</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                            <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{apiKeys.length}</p>
                    <button
                        onClick={() => setActiveTab('keys')}
                        className="text-xs text-blue-500 font-medium bg-transparent border-none cursor-pointer p-0 hover:text-blue-600"
                    >
                        Manage Access
                    </button>
                </div>

                {/* Rate Limit Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-500 font-medium">Rate Limit</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-3">
                        0<span className="text-lg font-normal text-gray-400"> / 1000</span>
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                </div>
            </div>

            {/* Trace History - Shows only 5 recent */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Trace History</h3>
                    {traceHistory.length > 0 && (
                        <button
                            onClick={() => setShowLogsModal(true)}
                            className="text-sm text-blue-500 font-medium bg-transparent border-none cursor-pointer hover:text-blue-600"
                        >
                            View All Logs
                        </button>
                    )}
                </div>
                <div className="overflow-hidden">
                    {recentHistory.length > 0 ? (
                        <TraceTable data={recentHistory} compact={true} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <p className="text-gray-500 font-medium mb-1">No API requests yet</p>
                            <p className="text-sm text-gray-400">When you make API calls, they'll appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
            {/* Logs Modal */}
            {showLogsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowLogsModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-5xl max-h-[85vh] flex flex-col z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">All Trace Logs</h2>
                                <p className="text-sm text-gray-500 mt-1">Complete history of API requests</p>
                            </div>
                            <button
                                onClick={() => setShowLogsModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 bg-transparent border-none cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-auto">
                            <TraceTable data={traceHistory} />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
                            <p className="text-sm text-gray-500">
                                Showing <span className="font-medium text-gray-700">{traceHistory.length}</span> log entries
                            </p>
                            <button
                                onClick={() => setShowLogsModal(false)}
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all duration-200 border-none cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar - Dark Theme matching Admin */}
            <aside className="w-56 bg-[#0f172a] flex flex-col h-screen">
                {/* Logo - Fixed at top */}
                <div className="p-5 border-b border-gray-700/50 flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2 text-white no-underline">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#3b82f6" />
                            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#3b82f6" opacity="0.7" />
                            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#3b82f6" opacity="0.7" />
                            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#3b82f6" opacity="0.4" />
                        </svg>
                        <span className="font-semibold text-lg">APIHub</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 border-none cursor-pointer ${activeTab === item.id
                                ? 'bg-blue-500/20 text-blue-400 border-l-[3px] border-l-blue-500'
                                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-l-transparent'
                                }`}
                        >
                            {getIcon(item.icon)}
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Info - Fixed at bottom */}
                <div className="border-t border-gray-700/50 p-4 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                            <div className="text-white text-sm font-medium">{user?.name || 'User'}</div>
                            <div className="text-blue-400 text-xs">Developer</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm bg-transparent border border-gray-700 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 hover:border-gray-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content - Light Theme */}
            <main className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            {activeTab === 'console' ? 'Console Overview' : 'My API Keys'}
                        </h1>
                        <p className="text-xs text-gray-500">
                            {activeTab === 'console'
                                ? 'Real-time metrics for your application instances.'
                                : 'Manage access tokens for your applications.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-9 pr-4 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-44 transition-all"
                            />
                        </div>
                        <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Dynamic Content based on active tab */}
                {activeTab === 'console' ? <ConsoleSection /> : <MyKeysSection />}
            </main>
        </div>
    );
};

export default Dashboard;
