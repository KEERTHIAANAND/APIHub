import { useState } from 'react';

const AuditLogs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [datasetFilter, setDatasetFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Audit logs data - starts empty, will be populated from backend
    const [auditLogs, setAuditLogs] = useState([]);

    // Dataset options for filter
    const datasetOptions = [
        { value: 'all', label: 'All Datasets' },
        { value: 'product-inventory', label: 'Product Inventory' },
        { value: 'customer-list', label: 'Customer List' },
        { value: 'orders', label: 'Orders' }
    ];

    // HTTP Methods for filter
    const methodOptions = [
        { value: 'all', label: 'All Methods' },
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'DELETE', label: 'DELETE' },
        { value: 'PATCH', label: 'PATCH' }
    ];

    // Status options for filter
    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'success', label: 'Success (2xx)' },
        { value: 'client-error', label: 'Client Error (4xx)' },
        { value: 'server-error', label: 'Server Error (5xx)' }
    ];

    // Get status code badge color
    const getStatusCodeColor = (code) => {
        if (code >= 200 && code < 300) {
            return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        } else if (code >= 400 && code < 500) {
            return 'bg-red-50 text-red-600 border-red-200';
        } else if (code >= 500) {
            return 'bg-orange-50 text-orange-600 border-orange-200';
        }
        return 'bg-gray-50 text-gray-600 border-gray-200';
    };

    // Get HTTP verb color
    const getVerbColor = (verb) => {
        switch (verb) {
            case 'GET':
                return 'text-blue-600';
            case 'POST':
                return 'text-green-600';
            case 'PUT':
                return 'text-yellow-600';
            case 'DELETE':
                return 'text-red-600';
            case 'PATCH':
                return 'text-purple-600';
            default:
                return 'text-gray-600';
        }
    };

    // Filter logs based on search and filters
    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = searchQuery === '' ||
            log.endpointPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.keyHash.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDataset = datasetFilter === 'all' ||
            log.dataset === datasetFilter;

        const matchesMethod = methodFilter === 'all' ||
            log.verb === methodFilter;

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'success' && log.code >= 200 && log.code < 300) ||
            (statusFilter === 'client-error' && log.code >= 400 && log.code < 500) ||
            (statusFilter === 'server-error' && log.code >= 500);

        return matchesSearch && matchesDataset && matchesMethod && matchesStatus;
    });

    // Calculate stats
    const totalLogs = filteredLogs.length;
    const failureLogs = filteredLogs.filter(log => log.code >= 400).length;

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

    const handleExportCSV = () => {
        // CSV export logic
        const headers = ['Timestamp', 'Code', 'Verb', 'Endpoint Path', 'Context', 'Key Hash', 'Latency'];
        const csvContent = [
            headers.join(','),
            ...filteredLogs.map(log =>
                [log.timestamp, log.code, log.verb, log.endpointPath, log.context, log.keyHash, log.latency + 'ms'].join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 overflow-auto p-4">
            {/* Stats Cards and Search Bar */}
            <div className="flex items-start gap-4 mb-4">
                {/* Stats Cards */}
                <div className="flex gap-3">
                    {/* Total Card */}
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-[100px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">TOTAL</span>
                            <span className="text-gray-400 text-xs">#</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{totalLogs}</div>
                    </div>

                    {/* Failures Card */}
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 min-w-[100px]">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">FAILURES</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-red-500">{failureLogs}</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search logs via regex..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        {/* Export CSV Button */}
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 text-xs font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Export CSV
                        </button>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-2">
                        {/* Dataset Filter */}
                        <div className="relative">
                            <select
                                value={datasetFilter}
                                onChange={(e) => setDatasetFilter(e.target.value)}
                                className="pl-2.5 pr-6 py-1 bg-white border border-gray-300 rounded-md text-gray-700 text-xs appearance-none cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
                            >
                                {datasetOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>

                        {/* Method Filter */}
                        <div className="relative">
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="pl-2.5 pr-6 py-1 bg-white border border-gray-300 rounded-md text-gray-700 text-xs appearance-none cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
                            >
                                {methodOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-2.5 pr-6 py-1 bg-white border border-gray-300 rounded-md text-gray-700 text-xs appearance-none cursor-pointer focus:outline-none focus:border-blue-500 transition-all"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-[120px_70px_70px_1fr_1fr_120px_70px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Timestamp</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Code</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Verb</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Endpoint Path</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Context</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Key Hash</div>
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider text-right">Lat</div>
                </div>

                {/* Table Body */}
                {paginatedLogs.map((log) => (
                    <div
                        key={log.id}
                        className="grid grid-cols-[120px_70px_70px_1fr_1fr_120px_70px] gap-3 px-4 py-2 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                        {/* Timestamp */}
                        <div className="text-xs text-gray-600 font-mono">
                            {log.timestamp}
                        </div>

                        {/* Code */}
                        <div className="flex items-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${getStatusCodeColor(log.code)}`}>
                                {log.code}
                            </span>
                        </div>

                        {/* Verb */}
                        <div className="flex items-center">
                            <span className={`text-xs font-semibold ${getVerbColor(log.verb)}`}>
                                {log.verb}
                            </span>
                        </div>

                        {/* Endpoint Path */}
                        <div className="flex items-center">
                            <code className="text-xs text-gray-700 font-mono">
                                {log.endpointPath}
                            </code>
                        </div>

                        {/* Context */}
                        <div className="flex items-center">
                            <span className="text-xs text-blue-500">
                                {log.context}
                            </span>
                        </div>

                        {/* Key Hash */}
                        <div className="flex items-center">
                            <span className="text-xs text-gray-500 font-mono">
                                {log.keyHash}
                            </span>
                        </div>

                        {/* Latency */}
                        <div className="flex items-center justify-end">
                            <span className="text-xs text-gray-500">
                                {log.latency}ms
                            </span>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {paginatedLogs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-gray-300">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <p className="text-sm font-medium text-gray-500 m-0">No audit logs found</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {searchQuery || datasetFilter !== 'all' || methodFilter !== 'all' || statusFilter !== 'all'
                                ? 'Try adjusting your filters'
                                : 'Logs will appear here as API requests are made'}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {filteredLogs.length > 0 && (
                <div className="flex items-center justify-between mt-3 px-1">
                    <div className="text-xs text-gray-500">
                        {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all cursor-pointer bg-transparent border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all cursor-pointer bg-transparent border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
