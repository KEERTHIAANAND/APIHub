import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="flex justify-between items-center px-12 py-6 relative z-50">
            <Link to="/" className="flex items-center gap-3 text-2xl font-semibold text-white no-underline">
                <img src="/apihub-logo.png" alt="APIHub Logo" className="w-8 h-8 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
                <span>APIHub</span>
            </Link>
            {/* Login button removed - now only on landing page below subtext */}
        </nav>
    );
};

export default Navbar;
