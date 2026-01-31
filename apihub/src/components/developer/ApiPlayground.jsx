import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const ApiPlayground = () => {
    const { apiKeys, endpoints } = useOutletContext();

    // State
    const [selectedKey, setSelectedKey] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState([
        { key: 'Content-Type', value: 'application/json', enabled: true }
    ]);
    const [body, setBody] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [responseTime, setResponseTime] = useState(null);
    const [activeTab, setActiveTab] = useState('headers');

    // Get active API keys
    const activeKeys = apiKeys?.filter(key => key.status === 'active') || [];
    const availableEndpoints = endpoints || [];

    // Base URL for API
    const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

    // Methods config
    const methods = [
        { name: 'GET', color: '#3b82f6' },
        { name: 'POST', color: '#22c55e' },
        { name: 'PUT', color: '#f59e0b' },
        { name: 'PATCH', color: '#a855f7' },
        { name: 'DELETE', color: '#ef4444' }
    ];

    const currentMethod = methods.find(m => m.name === method) || methods[0];

    // Auto-select first API key if available
    useEffect(() => {
        if (activeKeys.length > 0 && !selectedKey) {
            setSelectedKey(activeKeys[0]._id);
        }
    }, [activeKeys]);

    // Handle endpoint selection
    const handleEndpointChange = (e) => {
        const endpointPath = e.target.value;
        setSelectedEndpoint(endpointPath);

        if (endpointPath) {
            const ep = availableEndpoints.find(ep => ep.path === endpointPath);
            if (ep) {
                setCustomUrl(`${API_BASE}${ep.path}`);
                setMethod(ep.method);
            }
        } else {
            setCustomUrl('');
        }
    };

    // Add header row
    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '', enabled: true }]);
    };

    // Update header
    const updateHeader = (index, field, value) => {
        const newHeaders = [...headers];
        newHeaders[index][field] = value;
        setHeaders(newHeaders);
    };

    // Remove header
    const removeHeader = (index) => {
        setHeaders(headers.filter((_, i) => i !== index));
    };

    // Send request
    const sendRequest = async () => {
        if (!customUrl) return;

        setLoading(true);
        setResponse(null);
        const startTime = performance.now();

        try {
            const requestHeaders = {};
            headers.forEach(h => {
                if (h.enabled && h.key) {
                    requestHeaders[h.key] = h.value;
                }
            });

            // Add API key to headers
            if (selectedKey) {
                const keyData = activeKeys.find(k => k._id === selectedKey);
                if (keyData) {
                    requestHeaders['X-API-Key'] = keyData.fullKey || keyData.keyPrefix;
                }
            }

            const options = { method, headers: requestHeaders };

            if (method !== 'GET' && method !== 'HEAD' && body.trim()) {
                options.body = body;
            }

            const res = await fetch(customUrl, options);
            const endTime = performance.now();
            setResponseTime(Math.round(endTime - startTime));

            let data;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                data = await res.text();
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                data,
                ok: res.ok
            });

        } catch (error) {
            const endTime = performance.now();
            setResponseTime(Math.round(endTime - startTime));
            setResponse({
                status: 0,
                statusText: 'Error',
                data: { error: error.message },
                ok: false
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Endpoint & API Key Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Endpoint Selector */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                Select Endpoint
                            </label>
                            <select
                                value={selectedEndpoint}
                                onChange={handleEndpointChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            >
                                <option value="">Choose an endpoint...</option>
                                {availableEndpoints.map((ep, idx) => (
                                    <option key={idx} value={ep.path}>
                                        [{ep.method}] {ep.path}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* API Key Selector */}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">
                                API Key
                            </label>
                            <select
                                value={selectedKey}
                                onChange={(e) => setSelectedKey(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            >
                                <option value="">No API Key</option>
                                {activeKeys.map(key => (
                                    <option key={key._id} value={key._id}>
                                        {key.name} ({key.keyPrefix}...)
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* No endpoints/keys message */}
                    {availableEndpoints.length === 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                            ⚠️ No endpoints available. Please contact admin to get access to API endpoints.
                        </div>
                    )}
                    {activeKeys.length === 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                            ⚠️ No API keys available. Please check your API Keys section.
                        </div>
                    )}
                </div>

                {/* URL Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-5">
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Request</label>

                    {/* Method Buttons */}
                    <div className="flex gap-3 mb-4">
                        <div className="flex rounded-lg overflow-hidden border border-gray-200">
                            {methods.map(m => (
                                <button
                                    key={m.name}
                                    onClick={() => setMethod(m.name)}
                                    style={{
                                        backgroundColor: method === m.name ? m.color : 'white',
                                        color: method === m.name ? 'white' : '#6b7280'
                                    }}
                                    className="px-4 py-2 text-xs font-bold transition-all hover:opacity-90"
                                >
                                    {m.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* URL Input */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            placeholder="Select an endpoint or enter URL..."
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50"
                            readOnly={selectedEndpoint !== ''}
                        />
                        <button
                            onClick={sendRequest}
                            disabled={loading || !customUrl}
                            style={{ backgroundColor: currentMethod.color }}
                            className="px-8 py-3 text-white font-semibold rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            )}
                            Send
                        </button>
                    </div>
                </div>

                {/* Request Config */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('headers')}
                            className={`px-5 py-3 text-sm font-medium transition-all ${activeTab === 'headers'
                                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Headers
                        </button>
                        <button
                            onClick={() => setActiveTab('body')}
                            className={`px-5 py-3 text-sm font-medium transition-all ${activeTab === 'body'
                                    ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Body
                        </button>
                    </div>

                    <div className="p-5">
                        {activeTab === 'headers' && (
                            <div className="space-y-3">
                                {headers.map((header, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <input
                                            type="text"
                                            value={header.key}
                                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                                            placeholder="Header"
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <input
                                            type="text"
                                            value={header.value}
                                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                                            placeholder="Value"
                                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <button
                                            onClick={() => removeHeader(index)}
                                            className="text-gray-400 hover:text-red-500 p-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={addHeader}
                                    className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                                >
                                    + Add Header
                                </button>
                            </div>
                        )}

                        {activeTab === 'body' && (
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder='{"key": "value"}'
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                                spellCheck={false}
                            />
                        )}
                    </div>
                </div>

                {/* Response */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50">
                        <span className="text-sm font-medium text-gray-600">Response</span>
                        {response && (
                            <div className="flex items-center gap-3">
                                <span
                                    className="text-xs font-bold px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: response.ok ? '#dcfce7' : '#fee2e2',
                                        color: response.ok ? '#16a34a' : '#dc2626'
                                    }}
                                >
                                    {response.status} {response.statusText}
                                </span>
                                <span className="text-xs text-gray-400">{responseTime}ms</span>
                            </div>
                        )}
                    </div>

                    <div className="p-5">
                        {!response && !loading && (
                            <div className="text-center py-12 text-gray-400">
                                <p className="text-sm">Select an endpoint and click Send to test</p>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center py-12">
                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
                        )}

                        {response && (
                            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm font-mono max-h-80">
                                {typeof response.data === 'object'
                                    ? JSON.stringify(response.data, null, 2)
                                    : response.data
                                }
                            </pre>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiPlayground;
