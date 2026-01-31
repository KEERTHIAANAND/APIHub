import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ParticleSphere from '../components/ParticleSphere';

const LandingPage = () => {
    return (
        <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-[#0a0e14] via-[#0d1220] to-[#0a1628] relative overflow-hidden">
            {/* Background gradient overlay */}
            <div className="absolute top-0 right-0 w-3/5 h-full bg-[radial-gradient(ellipse_at_70%_50%,rgba(88,28,135,0.15)_0%,transparent_60%),radial-gradient(ellipse_at_80%_60%,rgba(6,95,70,0.1)_0%,transparent_50%)] pointer-events-none" />

            {/* Navigation */}
            <Navbar />

            {/* Hero Section */}
            <section className="flex-1 flex items-center px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full max-w-7xl mx-auto items-center">
                    {/* Hero Text */}
                    <div className="max-w-xl lg:max-w-none">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-7 tracking-tight text-white">
                            Build, Secure, and Monitor APIs From One Central Platform
                        </h1>
                        <p className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed">
                            Our centralized API management platform tracks and audits 100% of API requests, providing complete visibility and access control beyond what typical custom-built systems offer.
                        </p>
                        <Link
                            to="/login"
                            className="px-8 py-3.5 rounded-xl bg-green-500 text-gray-900 font-semibold text-base border-none cursor-pointer transition-all duration-300 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/35 flex items-center gap-2 no-underline inline-flex"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                <polyline points="10 17 15 12 10 7"></polyline>
                                <line x1="15" y1="12" x2="3" y2="12"></line>
                            </svg>
                            Get Started
                        </Link>
                    </div>

                    {/* Hero Visual */}
                    <div className="flex justify-center items-center lg:order-last order-first">
                        <ParticleSphere />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
