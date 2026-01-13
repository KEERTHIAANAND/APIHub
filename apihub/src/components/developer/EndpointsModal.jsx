const EndpointsModal = ({
    showModal,
    selectedKey,
    endpoints,
    onClose,
    getMethodColor
}) => {
    if (!showModal || !selectedKey) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 z-10 max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Accessible Endpoints</h2>
                        <p className="text-sm text-gray-500">{selectedKey.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {selectedKey.accessLevel === 'all' ? (
                        <div>
                            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span className="text-sm font-medium text-blue-700">Full Access - All {endpoints.length} endpoints</span>
                            </div>
                            <div className="space-y-2">
                                {endpoints.map((endpoint, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodColor(endpoint.method)}`}>
                                                {endpoint.method}
                                            </span>
                                            <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                                        </div>
                                        <p className="text-xs text-gray-500">{endpoint.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : selectedKey.endpoints?.length > 0 ? (
                        <div className="space-y-2">
                            {selectedKey.endpoints.map((endpoint, idx) => (
                                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getMethodColor(endpoint.method)}`}>
                                            {endpoint.method}
                                        </span>
                                        <code className="text-sm font-mono text-gray-700">{endpoint.path}</code>
                                    </div>
                                    <p className="text-xs text-gray-500">{endpoint.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>No specific endpoints assigned</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EndpointsModal;
