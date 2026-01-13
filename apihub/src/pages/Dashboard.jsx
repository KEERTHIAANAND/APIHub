import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { developerAPI } from '../services/api';
import { Overview, MyKeys, ApiDocs, EndpointsModal } from '../components/developer';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('overview');
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

    // Render content based on active nav
    const renderContent = () => {
        switch (activeNav) {
            case 'overview':
                return (
                    <Overview
                        stats={stats}
                        history={history}
                        setActiveNav={setActiveNav}
                        formatDate={formatDate}
                        getMethodColor={getMethodColor}
                        getStatusColor={getStatusColor}
                    />
                );
            case 'my-keys':
                return (
                    <MyKeys
                        apiKeys={apiKeys}
                        endpoints={endpoints}
                        copiedKey={copiedKey}
                        copyToClipboard={copyToClipboard}
                        setSelectedKey={setSelectedKey}
                        setShowEndpointsModal={setShowEndpointsModal}
                        getMethodColor={getMethodColor}
                    />
                );
            case 'api-docs':
                return <ApiDocs />;
            default:
                return (
                    <Overview
                        stats={stats}
                        history={history}
                        setActiveNav={setActiveNav}
                        formatDate={formatDate}
                        getMethodColor={getMethodColor}
                        getStatusColor={getStatusColor}
                    />
                );
        }
    };

    return (
        <div className="h-screen w-full flex bg-gray-50 overflow-hidden">
            {/* Sidebar - Dark Theme */}
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

                {/* Dynamic Content */}
                {renderContent()}
            </main>

            {/* Endpoints Modal */}
            <EndpointsModal
                showModal={showEndpointsModal}
                selectedKey={selectedKey}
                endpoints={endpoints}
                onClose={() => {
                    setShowEndpointsModal(false);
                    setSelectedKey(null);
                }}
                getMethodColor={getMethodColor}
            />
        </div>
    );
};

export default Dashboard;
