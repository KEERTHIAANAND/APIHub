import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { developerAPI } from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState(null);

    // Data states
    const [apiKeys, setApiKeys] = useState([]);
    const [stats, setStats] = useState({
        totalRequests: 0,
        avgLatency: 0,
        successRate: 0,
        errorCount: 0,
        activeKeys: 0,
        totalKeys: 0
    });
    const [history, setHistory] = useState([]);
    const [endpoints, setEndpoints] = useState([]);

    // Fetch data on mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [keysRes, statsRes, historyRes, endpointsRes] = await Promise.all([
                developerAPI.getMyApiKeys(),
                developerAPI.getMyStats(),
                developerAPI.getMyHistory({ limit: 10 }),
                developerAPI.getMyEndpoints()
            ]);

            if (keysRes.success) setApiKeys(keysRes.apiKeys);
            if (statsRes.success) setStats(statsRes.stats);
            if (historyRes.success) setHistory(historyRes.logs);
            if (endpointsRes.success) setEndpoints(endpointsRes.endpoints);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const copyToClipboard = (text, keyId) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: 'grid' },
        { id: 'my-keys', label: 'My Keys', icon: 'key' },
        { id: 'api-docs', label: 'API Docs', icon: 'book' },
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
            case 'book':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                );
            default:
                return null;
        }
    };

    const getPageInfo = () => {
        switch (activeNav) {
            case 'overview':
                return { title: 'Overview', subtitle: 'Monitor your API usage and statistics.' };
            case 'my-keys':
                return { title: 'My API Keys', subtitle: 'View and manage your assigned API keys.' };
            case 'api-docs':
                return { title: 'API Documentation', subtitle: 'Learn how to use the API.' };
            default:
                return { title: 'Dashboard', subtitle: 'Welcome to your developer portal.' };
        }
    };

    const getMethodColor = (method) => {
        switch (method) {
            case 'GET': return 'text-blue-500 bg-blue-50';
            case 'POST': return 'text-green-500 bg-green-50';
            case 'PUT': return 'text-amber-500 bg-amber-50';
            case 'DELETE': return 'text-red-500 bg-red-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    const getStatusColor = (status) => {
        if (status >= 200 && status < 300) return 'text-green-500';
        if (status >= 400) return 'text-red-500';
        return 'text-gray-500';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Render Overview Content
    const renderOverview = () => (
        <div className="p-6 flex-1 overflow-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalRequests.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Avg Latency</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.avgLatency}ms</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Success Rate</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Active Keys</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeKeys}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
                    <button
                        onClick={() => setActiveNav('my-keys')}
                        className="text-sm text-blue-600 hover:text-blue-700 bg-transparent border-none cursor-pointer"
                    >
                        View All Keys →
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Timestamp</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Method</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Path</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Latency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length > 0 ? (
                                history.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-sm text-gray-500">{formatDate(log.timestamp)}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getMethodColor(log.method)}`}>
                                                {log.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-sm font-mono text-gray-700">{log.path}</td>
                                        <td className={`px-6 py-3 text-sm font-medium ${getStatusColor(log.statusCode)}`}>{log.statusCode}</td>
                                        <td className="px-6 py-3 text-sm text-gray-500">{log.latency}ms</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No requests yet. Start using your API keys!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Render My Keys Content
    const renderMyKeys = () => (
        <div className="p-6 flex-1 overflow-auto">
            {apiKeys.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {apiKeys.map(key => (
                        <div key={key._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{key.name}</h3>
                                    {key.description && (
                                        <p className="text-sm text-gray-500 mt-1">{key.description}</p>
                                    )}
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${key.status === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}>
                                    {key.status}
                                </span>
                            </div>

                            {/* Key Display */}
                            <div className="bg-gray-900 rounded-lg p-3 mb-4 flex items-center justify-between">
                                <code className="text-sm text-green-400 font-mono">
                                    {key.keyPrefix}•••••••••••••
                                </code>
                                <button
                                    onClick={() => copyToClipboard(key.fullKey || key.keyPrefix, key._id)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer flex-shrink-0"
                                    title="Copy full API key"
                                >
                                    {copiedKey === key._id ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Key Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Access:</span>
                                    <span className="ml-2 text-gray-900">
                                        {key.accessLevel === 'all' ? 'All endpoints' : `${key.endpoints?.length || 0} endpoints`}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Usage:</span>
                                    <span className="ml-2 text-gray-900">{key.totalUsage?.toLocaleString() || 0} requests</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Rate Limit:</span>
                                    <span className="ml-2 text-gray-900">{key.rateLimit}/hr</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Created:</span>
                                    <span className="ml-2 text-gray-900">{new Date(key.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-4">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No API Keys Yet</h3>
                    <p className="text-gray-500">Contact your administrator to get API keys assigned.</p>
                </div>
            )}
        </div>
    );

    // Render API Docs Content
    const renderApiDocs = () => (
        <div className="p-6 flex-1 overflow-auto">
            {/* Quick Start */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Start</h3>
                <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-400 mb-2"># Make a request with your API key</p>
                    <code className="text-sm text-green-400 font-mono">
                        curl -H "X-API-Key: your_api_key" \<br />
                        &nbsp;&nbsp;http://localhost:5000/api/v1/products
                    </code>
                </div>
                <div className="text-sm text-gray-600">
                    <p className="mb-2"><strong>Base URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:5000/api/v1</code></p>
                    <p><strong>Authentication:</strong> Include your API key in the <code className="bg-gray-100 px-2 py-1 rounded">X-API-Key</code> header</p>
                </div>
            </div>

            {/* Available Endpoints */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Available Endpoints</h3>
                    <p className="text-sm text-gray-500 mt-1">Endpoints accessible with your API keys</p>
                </div>
                <div className="divide-y divide-gray-100">
                    {endpoints.length > 0 ? (
                        endpoints.map((endpoint, idx) => (
                            <div key={idx} className="px-6 py-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                                        {endpoint.method}
                                    </span>
                                    <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                                </div>
                                <p className="text-sm text-gray-600">{endpoint.name}</p>
                                {endpoint.description && (
                                    <p className="text-sm text-gray-400 mt-1">{endpoint.description}</p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-12 text-center text-gray-400">
                            No endpoints available. Get an API key to see accessible endpoints.
                        </div>
                    )}
                </div>
            </div>

            {/* Query Parameters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Parameters</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left px-4 py-2 font-medium text-gray-600">Parameter</th>
                                <th className="text-left px-4 py-2 font-medium text-gray-600">Type</th>
                                <th className="text-left px-4 py-2 font-medium text-gray-600">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-2 font-mono text-blue-600">page</td>
                                <td className="px-4 py-2 text-gray-600">integer</td>
                                <td className="px-4 py-2 text-gray-600">Page number (default: 1)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-mono text-blue-600">limit</td>
                                <td className="px-4 py-2 text-gray-600">integer</td>
                                <td className="px-4 py-2 text-gray-600">Items per page (default: 10, max: 100)</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-mono text-blue-600">sort</td>
                                <td className="px-4 py-2 text-gray-600">string</td>
                                <td className="px-4 py-2 text-gray-600">Field name to sort by</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-mono text-blue-600">order</td>
                                <td className="px-4 py-2 text-gray-600">string</td>
                                <td className="px-4 py-2 text-gray-600">Sort order: asc or desc</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-mono text-blue-600">[field]</td>
                                <td className="px-4 py-2 text-gray-600">string</td>
                                <td className="px-4 py-2 text-gray-600">Filter by field value (e.g., ?name=iPhone)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Render content based on active nav
    const renderContent = () => {
        switch (activeNav) {
            case 'overview':
                return renderOverview();
            case 'my-keys':
                return renderMyKeys();
            case 'api-docs':
                return renderApiDocs();
            default:
                return renderOverview();
        }
    };

    return (
        <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
            {/* Sidebar - Dark Theme (Exact copy from Admin) */}
            <aside className="w-56 bg-[#0f172a] flex flex-col">
                {/* Logo */}
                <div className="p-5 border-b border-gray-700/50">
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
                            onClick={() => setActiveNav(item.id)}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 border-none cursor-pointer ${activeNav === item.id
                                ? 'bg-blue-500/20 text-blue-400 border-l-[3px] border-l-blue-500'
                                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-l-transparent'
                                }`}
                        >
                            {getIcon(item.icon)}
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Info */}
                <div className="border-t border-gray-700/50 p-4">
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
                <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{getPageInfo().title}</h1>
                        <p className="text-xs text-gray-500">{getPageInfo().subtitle}</p>
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

                {/* Dynamic Content */}
                {renderContent()}
            </main>
        </div>
    );
};

export default Dashboard;
