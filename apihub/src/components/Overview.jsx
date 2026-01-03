const Overview = () => {
    // TODO: Fetch traffic data from your backend API
    // Example: useEffect(() => { fetchTrafficData().then(setTrafficData); }, []);
    const trafficData = [
        { time: '00:00', value: 0 },
        { time: '04:00', value: 0 },
        { time: '08:00', value: 0 },
        { time: '12:00', value: 0 },
        { time: '16:00', value: 0 },
        { time: '20:00', value: 0 },
        { time: '23:59', value: 0 },
    ];

    // Generate SVG path for traffic chart
    const generatePath = () => {
        const maxValue = 3600;
        const width = 600;
        const height = 220;
        const padding = 40;

        const points = trafficData.map((d, i) => {
            const x = padding + (i / (trafficData.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.value / maxValue) * (height - padding * 2);
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    };

    // Generate area path (for gradient fill under the line)
    const generateAreaPath = () => {
        const maxValue = 3600;
        const width = 600;
        const height = 220;
        const padding = 40;

        const points = trafficData.map((d, i) => {
            const x = padding + (i / (trafficData.length - 1)) * (width - padding * 2);
            const y = height - padding - (d.value / maxValue) * (height - padding * 2);
            return `${x},${y}`;
        });

        return `M ${padding},${height - padding} L ${points.join(' L ')} L ${width - padding},${height - padding} Z`;
    };

    return (
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-5">
                {/* Total Requests */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-xs font-medium">Total Requests</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">--</div>
                    <div className="text-xs text-gray-400 font-medium">No data available</div>
                </div>

                {/* Global Latency */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-xs font-medium">Global Latency</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">--<span className="text-base text-gray-400 ml-1 font-normal">ms</span></div>
                    <div className="text-xs text-gray-400 font-medium">No data available</div>
                </div>

                {/* Active Endpoints */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-xs font-medium">Active Endpoints</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        No endpoints
                    </div>
                </div>

                {/* Error Rate */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-500 text-xs font-medium">Error Rate</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">--%</div>
                    <div className="text-xs text-gray-400 font-medium">No data available</div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4">
                {/* Traffic Volume Chart */}
                <div className="col-span-2 bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="text-gray-900 font-semibold text-sm mb-4">Traffic Volume</h3>
                    <div className="relative h-56">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-gray-400 w-10">
                            <span>3600</span>
                            <span>2700</span>
                            <span>1800</span>
                            <span>900</span>
                            <span>0</span>
                        </div>

                        {/* Chart area */}
                        <div className="ml-10 h-full relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex flex-col justify-between">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <div key={i} className="border-b border-gray-100 w-full"></div>
                                ))}
                            </div>

                            {/* SVG Chart */}
                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                                {/* Gradient fill */}
                                <defs>
                                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                                    </linearGradient>
                                </defs>

                                {/* Area under curve */}
                                <path
                                    d={generateAreaPath()}
                                    fill="url(#chartGradient)"
                                />

                                {/* Line */}
                                <path
                                    d={generatePath()}
                                    fill="none"
                                    stroke="#3b82f6"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>

                            {/* X-axis labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-gray-400 -mb-5">
                                <span>00:00</span>
                                <span>04:00</span>
                                <span>08:00</span>
                                <span>12:00</span>
                                <span>16:00</span>
                                <span>20:00</span>
                                <span>23:59</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Codes Chart */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h3 className="text-gray-900 font-semibold text-sm mb-4">Status Codes</h3>

                    {/* Donut Chart */}
                    <div className="flex justify-center mb-5">
                        <div className="relative w-36 h-36">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#f3f4f6"
                                    strokeWidth="10"
                                />
                                {/* 2xx Series - Green (85%) */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="#22c55e"
                                    strokeWidth="10"
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
                                    strokeWidth="10"
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
                                    strokeWidth="10"
                                    strokeDasharray="12.6 251.2"
                                    strokeDashoffset="-238.7"
                                    strokeLinecap="round"
                                />
                            </svg>
                            {/* Center text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-green-500">100%</span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Load</span>
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                                <span className="text-gray-600 text-xs">2xx Series</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-xs">--%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                                <span className="text-gray-600 text-xs">4xx Series</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-xs">--%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                <span className="text-gray-600 text-xs">5xx Series</span>
                            </div>
                            <span className="text-gray-900 font-semibold text-xs">--%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
