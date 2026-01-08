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
            {/* Login button removed - now only on landing page below subtext */}
        </nav>
    );
};

export default Navbar;
