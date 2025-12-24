import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        { id: 'api-management', label: 'API Management', icon: 'api' },
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
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
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

    // Traffic data points for the chart
    const trafficData = [
        { time: '00:00', value: 200 },
        { time: '04:00', value: 400 },
        { time: '08:00', value: 900 },
        { time: '12:00', value: 2700 },
        { time: '16:00', value: 2200 },
        { time: '20:00', value: 2800 },
        { time: '23:00', value: 3400 },
    ];

    // Generate SVG path for traffic chart
    const generatePath = () => {
        const maxValue = 3600;
        const width = 600;
        const height = 250;
        const padding = 40;

        const points = trafficData.map((d, i) => {
            const x = padding + (i / (trafficData.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.value / maxValue) * (height - padding * 2);
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    return (
        <div className="h-screen w-full flex bg-[#0a0e14] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-56 bg-[#0d1117] border-r border-gray-800 flex flex-col">
                {/* Logo */}
                <div className="p-5 border-b border-gray-800">
                    <Link to="/" className="flex items-center gap-2 text-white no-underline">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
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
                                    ? 'bg-[#1a2332] text-white border-l-2 border-l-green-500'
                                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-[#151b25]'
                                }`}
                        >
                            {getIcon(item.icon)}
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* User Info */}
                <div className="border-t border-gray-800 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <div className="text-white text-sm font-medium">{user?.name || 'Admin User'}</div>
                            <div className="text-gray-500 text-xs">Admin</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white text-sm bg-transparent border-none cursor-pointer transition-colors"
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

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
                    <h1 className="text-xl font-semibold text-white">Overview</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-[#151b25] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-gray-600 w-48"
                            />
                        </div>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-auto p-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-5 mb-6">
                        {/* Total Requests */}
                        <div className="bg-[#111827] rounded-xl p-5 border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm">Total Requests</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                    <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">2.4M</div>
                            <div className="text-xs text-green-500">↑ 12% vs 30d avg</div>
                        </div>

                        {/* Global Latency */}
                        <div className="bg-[#111827] rounded-xl p-5 border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm">Global Latency</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <polyline points="22 17 13.5 8 8.5 13 1 6"></polyline>
                                    <polyline points="16 17 22 17 22 11"></polyline>
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">45<span className="text-lg text-gray-400 ml-1">ms</span></div>
                            <div className="text-xs text-green-500">↑ 5% efficiency</div>
                        </div>

                        {/* Active Endpoints */}
                        <div className="bg-[#111827] rounded-xl p-5 border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm">Active Endpoints</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">2</div>
                            <div className="flex items-center gap-1 text-xs text-green-500">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                Operational
                            </div>
                        </div>

                        {/* Error Rate */}
                        <div className="bg-[#111827] rounded-xl p-5 border border-gray-800">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-gray-400 text-sm">Error Rate</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">0.12%</div>
                            <div className="text-xs text-yellow-500">↑ 2% slight increase</div>
                        </div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-3 gap-5">
                        {/* Traffic Volume Chart */}
                        <div className="col-span-2 bg-[#111827] rounded-xl p-6 border border-gray-800">
                            <h3 className="text-white font-semibold mb-6">Traffic Volume</h3>
                            <div className="relative h-64">
                                {/* Y-axis labels */}
                                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 w-12">
                                    <span>3600</span>
                                    <span>2700</span>
                                    <span>1800</span>
                                    <span>900</span>
                                    <span>0</span>
                                </div>

                                {/* Chart area */}
                                <div className="ml-12 h-full relative">
                                    {/* Grid lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div key={i} className="border-b border-gray-800 w-full"></div>
                                        ))}
                                    </div>

                                    {/* SVG Chart */}
                                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 250" preserveAspectRatio="none">
                                        {/* Gradient fill */}
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                                                <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                            </linearGradient>
                                        </defs>

                                        {/* Area under curve */}
                                        <path
                                            d={`${generatePath()} L 560,210 L 40,210 Z`}
                                            fill="url(#chartGradient)"
                                        />

                                        {/* Line */}
                                        <path
                                            d={generatePath()}
                                            fill="none"
                                            stroke="#3b82f6"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>

                                    {/* X-axis labels */}
                                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 -mb-6">
                                        <span>00:00</span>
                                        <span>04:00</span>
                                        <span>08:00</span>
                                        <span>12:00</span>
                                        <span>16:00</span>
                                        <span>20:00</span>
                                        <span>23:00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Codes Chart */}
                        <div className="bg-[#111827] rounded-xl p-6 border border-gray-800">
                            <h3 className="text-white font-semibold mb-6">Status Codes</h3>

                            {/* Donut Chart */}
                            <div className="flex justify-center mb-6">
                                <div className="relative w-40 h-40">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        {/* Background circle */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#1f2937"
                                            strokeWidth="12"
                                        />
                                        {/* 2xx Series - Green (85%) */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="12"
                                            strokeDasharray="213.6 251.2"
                                            strokeDashoffset="0"
                                            strokeLinecap="round"
                                        />
                                        {/* 4xx Series - Orange (10%) */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#f97316"
                                            strokeWidth="12"
                                            strokeDasharray="25.1 251.2"
                                            strokeDashoffset="-213.6"
                                            strokeLinecap="round"
                                        />
                                        {/* 5xx Series - Red (5%) */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#ef4444"
                                            strokeWidth="12"
                                            strokeDasharray="12.6 251.2"
                                            strokeDashoffset="-238.7"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    {/* Center text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-white">100%</span>
                                        <span className="text-xs text-gray-500">LOAD</span>
                                    </div>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                        <span className="text-gray-400 text-sm">2xx Series</span>
                                    </div>
                                    <span className="text-white font-medium">85%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                        <span className="text-gray-400 text-sm">4xx Series</span>
                                    </div>
                                    <span className="text-white font-medium">10%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                        <span className="text-gray-400 text-sm">5xx Series</span>
                                    </div>
                                    <span className="text-white font-medium">5%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
