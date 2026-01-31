import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import APIManagement from '../components/APIManagement';
import DataManagement from '../components/DataManagement';
import Overview from '../components/Overview';
import AccessKeys from '../components/AccessKeys';
import AuditLogs from '../components/AuditLogs';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeNav, setActiveNav] = useState('overview');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { id: 'overview', label: 'Overview', icon: 'grid' },
        { id: 'api-management', label: 'Endpoint Management', icon: 'api' },
        { id: 'data-management', label: 'Data Management', icon: 'database' },
        { id: 'access-keys', label: 'Access Keys', icon: 'key' },
        { id: 'audit-logs', label: 'Audit Logs', icon: 'logs' },
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
            case 'api':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                );
            case 'database':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                );
            case 'key':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                    </svg>
                );
            case 'logs':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                );
            default:
                return null;
        }
    };

    // Get the title and subtitle for current active section
    const getPageInfo = () => {
        switch (activeNav) {
            case 'overview':
                return { title: 'Overview', subtitle: 'Monitor your API performance and analytics.' };
            case 'api-management':
                return { title: 'Endpoint Management', subtitle: 'Create and manage your API endpoints.' };
            case 'data-management':
                return { title: 'Data Management', subtitle: 'Upload and configure your datasets.' };
            case 'access-keys':
                return { title: 'Access Keys', subtitle: 'Manage API keys and access control.' };
            case 'audit-logs':
                return { title: 'Audit Logs', subtitle: 'Track all system activities and changes.' };
            default:
                return { title: 'Dashboard', subtitle: 'Welcome to your admin dashboard.' };
        }
    };

    // Render the content based on active navigation
    const renderContent = () => {
        switch (activeNav) {
            case 'api-management':
                return <APIManagement />;
            case 'overview':
                return <Overview />;
            case 'data-management':
                return <DataManagement />;
            case 'access-keys':
                return <AccessKeys />;
            case 'audit-logs':
                return <AuditLogs />;
            default:
                return <APIManagement />;
        }
    };

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
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <div className="text-white text-sm font-medium">{user?.name || 'Admin'}</div>
                            <div className="text-blue-400 text-xs">Admin</div>
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

                {/* Dynamic Content based on active navigation */}
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminDashboard;
