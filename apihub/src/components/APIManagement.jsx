import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const APIManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [datasets, setDatasets] = useState([]);
    const [endpoints, setEndpoints] = useState([]);

    const [formData, setFormData] = useState({
        datasetId: '',
        name: '',
        description: '',
        path: '',
        method: 'GET',
        isActive: true
    });

    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];

    // Fetch endpoints and datasets on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [endpointsRes, datasetsRes] = await Promise.all([
                adminAPI.getEndpoints(),
                adminAPI.getDatasets()
            ]);

            if (endpointsRes.success) {
                setEndpoints(endpointsRes.endpoints);
            }
            if (datasetsRes.success) {
                setDatasets(datasetsRes.datasets);
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

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
            default:
                return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // Filter endpoints based on search query
    const filteredEndpoints = endpoints.filter(endpoint =>
        endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await adminAPI.createEndpoint({
                name: formData.name,
                description: formData.description,
                method: formData.method,
                path: formData.path,
                datasetId: formData.datasetId,
                isActive: formData.isActive
            });

            if (response.success) {
                await fetchData();
                handleCloseModal();
            } else {
                setError(response.error || 'Failed to create endpoint');
            }
        } catch (err) {
            setError(err.message || 'Failed to create endpoint');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleEndpoint = async (endpointId) => {
        try {
            const response = await adminAPI.toggleEndpoint(endpointId);
            if (response.success) {
                await fetchData();
            } else {
                alert(response.error || 'Failed to toggle endpoint');
            }
        } catch (err) {
            alert(err.message || 'Failed to toggle endpoint');
        }
    };

    const handleDeleteEndpoint = async (endpointId) => {
        if (!confirm('Are you sure you want to delete this endpoint?')) return;

        try {
            const response = await adminAPI.deleteEndpoint(endpointId);
            if (response.success) {
                await fetchData();
            } else {
                alert(response.error || 'Failed to delete endpoint');
            }
        } catch (err) {
            alert(err.message || 'Failed to delete endpoint');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({
            datasetId: '',
            name: '',
            description: '',
            path: '',
            method: 'GET',
            isActive: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading endpoints...</p>
                </div>
            </div>
        );
    }

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
                    {error && <span className="text-sm text-red-500">{error}</span>}
                    <button
                        onClick={() => setShowModal(true)}
                        disabled={datasets.length === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 border-none rounded-lg text-white text-xs font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Endpoint
                    </button>
                </div>
            </div>

            {datasets.length === 0 && (
                <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
                    ⚠️ Create a dataset first before creating endpoints.
                </div>
            )}

            {/* API Endpoints Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Name / Dataset</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Route</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Method</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">State</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Updated</div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</div>
                </div>

                {/* Table Body */}
                {filteredEndpoints.map((endpoint) => (
                    <div
                        key={endpoint._id}
                        className="grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-3 px-5 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                        {/* Name / Dataset */}
                        <div>
                            <div className="text-xs font-medium text-gray-900">{endpoint.name}</div>
                            <div className="text-[11px] text-blue-500 mt-0.5">
                                {endpoint.datasetId?.name || 'No dataset'}
                            </div>
                        </div>

                        {/* Route */}
                        <div className="flex items-center">
                            <code className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-mono">
                                {endpoint.path}
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
                            <button
                                onClick={() => handleToggleEndpoint(endpoint._id)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium cursor-pointer border bg-transparent ${endpoint.isActive
                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                <span className={`w-1 h-1 rounded-full ${endpoint.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                {endpoint.isActive ? 'active' : 'inactive'}
                            </button>
                        </div>

                        {/* Updated */}
                        <div className="flex items-center">
                            <span className="text-xs text-gray-500">{formatDate(endpoint.updatedAt)}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => handleDeleteEndpoint(endpoint._id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all cursor-pointer bg-transparent border-none"
                                title="Delete endpoint"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
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
                            <h2 className="text-lg font-semibold text-gray-900">Create Endpoint</h2>
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
                                    Dataset Source *
                                </label>
                                <div className="relative">
                                    <select
                                        name="datasetId"
                                        value={formData.datasetId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    >
                                        <option value="">Select a dataset</option>
                                        {datasets.map(ds => (
                                            <option key={ds._id} value={ds._id}>
                                                {ds.name} ({ds.recordCount} records)
                                            </option>
                                        ))}
                                    </select>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </div>

                            {/* Endpoint Name */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Endpoint Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Get All Products"
                                    required
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* Route Path */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Route Path *
                                </label>
                                <input
                                    type="text"
                                    name="path"
                                    value={formData.path}
                                    onChange={handleInputChange}
                                    placeholder="/products"
                                    required
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">Will be prefixed with /api/v1</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Brief description of the endpoint"
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            {/* HTTP Method */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                    HTTP Method
                                </label>
                                <div className="flex gap-2">
                                    {httpMethods.map(method => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, method }))}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium border cursor-pointer transition-all ${formData.method === method
                                                ? getMethodBadgeColor(method)
                                                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
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
                                    disabled={saving || !formData.datasetId || !formData.name || !formData.path}
                                    className="px-6 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md disabled:opacity-50"
                                >
                                    {saving ? 'Creating...' : 'Create Endpoint'}
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
