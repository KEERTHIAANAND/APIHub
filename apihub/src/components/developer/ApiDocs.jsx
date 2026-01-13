const ApiDocs = () => {
    return (
        <div className="p-6 flex-1 overflow-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">API Documentation</h2>
                <p className="text-gray-500 mt-1">Learn how to integrate with our API</p>
            </div>

            {/* Connection Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Base URL</p>
                    <code className="text-sm font-mono text-gray-900">http://localhost:5000/api/v1</code>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Authentication</p>
                    <code className="text-sm font-mono text-gray-900">X-API-Key: your_key</code>
                </div>
            </div>

            {/* Quick Start */}
            <div className="bg-white rounded-xl p-5 mb-6 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-900">Quick Start</span>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">npm install axios</code>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <pre className="text-sm text-slate-700 font-mono overflow-x-auto">{`const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: { 'X-API-Key': 'your_key' }
});

const { data } = await api.get('/products');`}</pre>
                </div>
            </div>

            {/* Parameters Reference */}
            <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Query Parameters</h4>
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded w-20 text-center">page</code>
                        <span className="text-sm text-gray-600">Page number for pagination (default: 1)</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded w-20 text-center">limit</code>
                        <span className="text-sm text-gray-600">Items per page (default: 10, max: 100)</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded w-20 text-center">sort</code>
                        <span className="text-sm text-gray-600">Field name to sort results by</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded w-20 text-center">order</code>
                        <span className="text-sm text-gray-600">Sort order: asc or desc</span>
                    </div>
                </div>
            </div>

            {/* Request/Response Examples */}
            <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Request & Response Examples</h4>
                <div className="grid grid-cols-2 gap-4">
                    {/* GET Request */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">GET</span>
                            <span className="text-xs text-gray-500">Request</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <pre className="text-xs text-slate-700 font-mono overflow-x-auto leading-relaxed">{`const { data } = await api.get('/customers', {
  params: { 
    status: 'active',
    limit: 10 
  }
});`}</pre>
                        </div>
                    </div>

                    {/* GET Response */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">200</span>
                            <span className="text-xs text-gray-500">Response</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <pre className="text-xs text-green-800 font-mono overflow-x-auto leading-relaxed">{`{
  "success": true,
  "data": [
    { "_id": "64a7...", "name": "John Doe" },
    { "_id": "64a8...", "name": "Jane Smith" }
  ],
  "total": 156
}`}</pre>
                        </div>
                    </div>

                    {/* POST Request */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700">POST</span>
                            <span className="text-xs text-gray-500">Request</span>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                            <pre className="text-xs text-slate-700 font-mono overflow-x-auto leading-relaxed">{`const { data } = await api.post('/orders', {
  customerId: '64a7b2c1...',
  items: [
    { productId: '...', qty: 2 }
  ],
  total: 199.99
});`}</pre>
                        </div>
                    </div>

                    {/* POST Response */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">201</span>
                            <span className="text-xs text-gray-500">Response</span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <pre className="text-xs text-green-800 font-mono overflow-x-auto leading-relaxed">{`{
  "success": true,
  "data": {
    "_id": "64b2c1e5f8a9...",
    "orderId": "ORD-2024-001",
    "status": "pending",
    "createdAt": "2024-01-13T..."
  }
}`}</pre>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Codes */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">Status Codes</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 w-14 text-center">200</span>
                        <span className="text-sm text-gray-600">Success - Request completed</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700 w-14 text-center">201</span>
                        <span className="text-sm text-gray-600">Created - Resource created</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700 w-14 text-center">400</span>
                        <span className="text-sm text-gray-600">Bad Request - Invalid data</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700 w-14 text-center">401</span>
                        <span className="text-sm text-gray-600">Unauthorized - Invalid API key</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 w-14 text-center">403</span>
                        <span className="text-sm text-gray-600">Forbidden - Access denied</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-700 w-14 text-center">404</span>
                        <span className="text-sm text-gray-600">Not Found - Resource missing</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 w-14 text-center">429</span>
                        <span className="text-sm text-gray-600">Too Many Requests - Rate limited</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 w-14 text-center">500</span>
                        <span className="text-sm text-gray-600">Server Error - Try again later</span>
                    </div>
                </div>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-400 mt-4 text-center">
                View available endpoints for each API key in the "My Keys" section
            </p>
        </div>
    );
};

export default ApiDocs;
