import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { developerAPI } from '../../services/api';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [copiedKey, setCopiedKey] = useState(null);
    const [showEndpointsModal, setShowEndpointsModal] = useState(false);
    const [selectedKey, setSelectedKey] = useState(null);

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

    // Get active nav from URL
    const getActiveNav = () => {
        const path = location.pathname;
        if (path === '/my-keys') return 'my-keys';
        if (path === '/api-docs') return 'api-docs';
        if (path === '/playground') return 'playground';
        return 'overview';
    };

    const activeNav = getActiveNav();

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

    const handleClearHistory = async () => {
        try {
            const res = await developerAPI.clearHistory();
            if (res.success) {
                // Clear local state
                setHistory([]);
                // Refresh stats since they depend on request logs
                const statsRes = await developerAPI.getMyStats();
                if (statsRes.success) setStats(statsRes.stats);
            }
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const copyToClipboard = (text, keyId) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(keyId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: 'grid', path: '/overview' },
        { id: 'my-keys', label: 'My Keys', icon: 'key', path: '/my-keys' },
        { id: 'api-docs', label: 'API Docs', icon: 'book', path: '/api-docs' },
        { id: 'playground', label: 'Playground', icon: 'play', path: '/playground' },
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
            case 'play':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
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
            case 'playground':
                return { title: 'API Playground', subtitle: 'Test your API endpoints in real-time.' };
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

    return (
        <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
            {/* Sidebar - Dark Theme */}
            <aside className="w-56 bg-[#0f172a] flex flex-col">
                {/* Logo */}
                <div className="p-5 border-b border-gray-700/50">
                    <Link to="/" className="flex items-center gap-2 text-white no-underline">
                        <img src="/apihub-logo.png" alt="APIHub Logo" className="w-7 h-7 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                        <span className="font-semibold text-lg">APIHub</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 no-underline ${activeNav === item.id
                                ? 'bg-blue-500/20 text-blue-400 border-l-[3px] border-l-blue-500'
                                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5 border-l-[3px] border-l-transparent'
                                }`}
                        >
                            {getIcon(item.icon)}
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
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
                {/* Header - Hidden for API Docs */}
                {activeNav !== 'api-docs' && (
                    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">{getPageInfo().title}</h1>
                            <p className="text-xs text-gray-500">{getPageInfo().subtitle}</p>
                        </div>
                        {activeNav === 'overview' && (
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
                        )}
                    </header>
                )}

                {/* Dynamic Content via Outlet */}
                <Outlet context={{
                    stats,
                    history,
                    apiKeys,
                    endpoints,
                    copiedKey,
                    copyToClipboard,
                    setSelectedKey,
                    setShowEndpointsModal,
                    formatDate,
                    getMethodColor,
                    getStatusColor,
                    navigate,
                    clearHistory: handleClearHistory
                }} />
            </main>

            {/* Endpoints Modal */}
            {showEndpointsModal && selectedKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={() => {
                            setShowEndpointsModal(false);
                            setSelectedKey(null);
                        }}
                    ></div>

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 z-10 max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Accessible Endpoints</h2>
                                <p className="text-sm text-gray-500">{selectedKey.name}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEndpointsModal(false);
                                    setSelectedKey(null);
                                }}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto max-h-[60vh]">
                            {selectedKey.accessLevel === 'all' ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                        </svg>
                                        <span className="text-sm font-medium text-blue-700">Full Access - All {endpoints.length} endpoints</span>
                                    </div>
                                    <div className="space-y-2">
                                        {endpoints.map((endpoint, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodColor(endpoint.method)}`}>
                                                        {endpoint.method}
                                                    </span>
                                                    <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                                                </div>
                                                <p className="text-xs text-gray-500">{endpoint.name}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : selectedKey.endpoints?.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedKey.endpoints.map((endpoint, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodColor(endpoint.method)}`}>
                                                    {endpoint.method}
                                                </span>
                                                <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                                            </div>
                                            <p className="text-xs text-gray-500">{endpoint.name}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <p>No specific endpoints assigned</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
