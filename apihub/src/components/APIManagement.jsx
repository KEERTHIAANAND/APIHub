import { useState } from 'react';

const APIManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        datasetSource: '',
        identifierName: '',
        routePath: '',
        httpVerb: 'GET',
        initialState: 'active'
    });

    // TODO: Fetch API endpoints from your backend
    // Example: useEffect(() => { fetchEndpoints().then(setApiEndpoints); }, []);
    const [apiEndpoints, setApiEndpoints] = useState([]);

    // Dataset sources - will be populated from Data Management section
    const datasetSources = [
        { value: '', label: '-- Null --' }
    ];

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const stateOptions = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
    ];

    const getMethodBadgeColor = (method) => {
        switch (method) {
            case 'GET':
                return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'POST':
                return 'bg-green-100 text-green-600 border-green-200';
            case 'PUT':
                return 'bg-yellow-100 text-yellow-600 border-yellow-200';
            case 'DELETE':
                return 'bg-red-100 text-red-600 border-red-200';
            case 'PATCH':
                return 'bg-purple-100 text-purple-600 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // Filter endpoints based on search query
    const filteredEndpoints = apiEndpoints.filter(endpoint =>
        endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.context.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create new endpoint object
        const newEndpoint = {
            id: Date.now(),
            name: formData.identifierName,
            context: `ds_id: ${datasetSources.find(ds => ds.value === formData.datasetSource)?.label || 'None'}`,
            route: formData.routePath,
            method: formData.httpVerb,
            state: formData.initialState,
            updated: new Date().toISOString().split('T')[0]
        };

        // Add to endpoints list
        setApiEndpoints(prev => [...prev, newEndpoint]);

        // Reset form and close modal
        setFormData({
            datasetSource: '',
            identifierName: '',
            routePath: '',
            httpVerb: 'GET',
            initialState: 'active'
        });
        setShowModal(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            datasetSource: '',
            identifierName: '',
            routePath: '',
            httpVerb: 'GET',
            initialState: 'active'
        });
    };

    return (
        <div className="flex-1 overflow-auto p-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search API endpoints..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-xs font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        Filters
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 border-none rounded-lg text-white text-xs font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Endpoint
                    </button>
                </div>
            </div>

            {/* API Endpoints Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_60px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Name / Context</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Route</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Method</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">State</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Updated</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</div>
                </div>

                {/* Table Body */}
                {filteredEndpoints.map((endpoint) => (
                    <div
                        key={endpoint.id}
                        className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_60px] gap-3 px-5 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                        {/* Name / Context */}
                        <div>
                            <div className="text-xs font-medium text-gray-900">{endpoint.name}</div>
                            <div className="text-[11px] text-blue-500 mt-0.5">{endpoint.context}</div>
                        </div>

                        {/* Route */}
                        <div className="flex items-center">
                            <code className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-mono">
                                {endpoint.route}
                            </code>
                        </div>

                        {/* Method */}
                        <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getMethodBadgeColor(endpoint.method)}`}>
                                {endpoint.method}
                            </span>
                        </div>

                        {/* State */}
                        <div className="flex items-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${endpoint.state === 'active'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                                }`}>
                                <span className={`w-1 h-1 rounded-full ${endpoint.state === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                    }`}></span>
                                {endpoint.state}
                            </span>
                        </div>

                        {/* Updated */}
                        <div className="flex items-center">
                            <span className="text-xs text-gray-500">{endpoint.updated}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-center">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all cursor-pointer bg-transparent border-none">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="1"></circle>
                                    <circle cx="19" cy="12" r="1"></circle>
                                    <circle cx="5" cy="12" r="1"></circle>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty state if no endpoints match search */}
                {filteredEndpoints.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                        </svg>
                        <p className="text-lg font-medium text-gray-500">No API endpoints found</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchQuery ? 'Try adjusting your search query' : 'Create your first endpoint to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* Register Endpoint Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Register Endpoint</h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Dataset Source */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Dataset Source
                                </label>
                                <div className="relative">
                                    <select
                                        name="datasetSource"
                                        value={formData.datasetSource}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    >
                                        {datasetSources.map(ds => (
                                            <option key={ds.value} value={ds.value}>{ds.label}</option>
                                        ))}
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>

                            {/* Identifier Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Identifier Name
                                </label>
                                <input
                                    type="text"
                                    name="identifierName"
                                    value={formData.identifierName}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Products V2"
                                    required
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* Route Path */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Route Path
                                </label>
                                <input
                                    type="text"
                                    name="routePath"
                                    value={formData.routePath}
                                    onChange={handleInputChange}
                                    placeholder="/api/v..."
                                    required
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* HTTP Verb and Initial State Row */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* HTTP Verb */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        HTTP Verb
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="httpVerb"
                                            value={formData.httpVerb}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        >
                                            {httpMethods.map(method => (
                                                <option key={method} value={method}>{method}</option>
                                            ))}
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>

                                {/* Initial State */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        Initial State
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="initialState"
                                            value={formData.initialState}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        >
                                            {stateOptions.map(state => (
                                                <option key={state.value} value={state.value}>{state.label}</option>
                                            ))}
                                        </select>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-center gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default APIManagement;
