import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
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

            <div className="flex items-center gap-6">
                <Link
                    to="/login"
                    className="px-7 py-2.5 rounded-xl bg-green-500 text-gray-900 font-semibold text-sm border-none cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-2 no-underline"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                        <polyline points="10 17 15 12 10 7"></polyline>
                        <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    Login
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
