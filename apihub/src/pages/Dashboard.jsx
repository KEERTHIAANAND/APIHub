import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#0a0e14] via-[#0d1220] to-[#0a1628] relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute top-0 right-0 w-3/5 h-full bg-[radial-gradient(ellipse_at_70%_50%,rgba(88,28,135,0.15)_0%,transparent_60%),radial-gradient(ellipse_at_80%_60%,rgba(6,95,70,0.1)_0%,transparent_50%)] pointer-events-none" />

            {/* Navigation */}
            <nav className="flex justify-between items-center px-12 py-6 relative z-50">
                <Link to="/" className="flex items-center gap-3 text-2xl font-semibold text-white no-underline">
                    <span className="w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                            <line x1="10" y1="6.5" x2="14" y2="6.5" stroke="currentColor" strokeWidth="2" />
                            <line x1="6.5" y1="10" x2="6.5" y2="14" stroke="currentColor" strokeWidth="2" />
                            <line x1="17.5" y1="10" x2="17.5" y2="14" stroke="currentColor" strokeWidth="2" />
                            <line x1="10" y1="17.5" x2="14" y2="17.5" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </span>
                    <span>APIHub</span>
                </Link>

                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-sm">{user?.email}</span>
                    <button
                        onClick={logout}
                        className="px-5 py-2 rounded-xl bg-red-500/20 text-red-400 font-medium text-sm border border-red-500/30 cursor-pointer transition-all duration-300 hover:bg-red-500/30 hover:border-red-500/50 flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Welcome Content */}
            <div className="flex-1 flex items-center justify-center px-12 relative z-10">
                <div className="text-center max-w-2xl">
                    {/* Welcome Icon */}
                    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>

                    {/* Welcome Message */}
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Welcome, <span className="text-green-500">{user?.name}</span>! 🎉
                    </h1>
                    <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                        You've successfully logged in to APIHub. Your centralized API management dashboard is ready to help you build, secure, and monitor your APIs.
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
                            <div className="text-3xl font-bold text-green-500 mb-2">0</div>
                            <div className="text-gray-400 text-sm">APIs Connected</div>
                        </div>
                        <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
                            <div className="text-3xl font-bold text-blue-500 mb-2">0</div>
                            <div className="text-gray-400 text-sm">Total Requests</div>
                        </div>
                        <div className="bg-[#111827]/80 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
                            <div className="text-3xl font-bold text-purple-500 mb-2">100%</div>
                            <div className="text-gray-400 text-sm">Uptime</div>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="px-8 py-3 rounded-xl bg-green-500 text-gray-900 font-semibold text-base border-none cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/35 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Your First API
                        </button>
                        <button className="px-8 py-3 rounded-xl bg-transparent text-white font-semibold text-base border border-gray-700 cursor-pointer transition-all duration-300 hover:bg-white/5 hover:border-gray-500 hover:-translate-y-0.5 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polygon points="10 8 16 12 10 16 10 8"></polygon>
                            </svg>
                            Watch Tutorial
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
