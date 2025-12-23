const Navbar = () => {
    return (
        <nav className="flex justify-between items-center px-12 py-6 relative z-50">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 text-2xl font-semibold text-white no-underline">
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
            </a>

            {/* Login Button */}
            <div className="flex items-center gap-6">
                <button className="px-7 py-2.5 rounded-full bg-green-500 text-gray-900 font-semibold text-sm border-none cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/30">
                    Login
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
