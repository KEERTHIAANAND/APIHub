import { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../services/api';

const DataManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('manual'); // 'manual' or 'upload'
    const [modalStep, setModalStep] = useState(1);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Datasets state - fetched from backend
    const [datasets, setDatasets] = useState([]);

    // File upload state
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [uploadName, setUploadName] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');

    // Form state for new dataset (manual entry)
    const [formData, setFormData] = useState({
        datasetName: '',
        description: '',
        numberOfFields: 2,
        initialItems: 1,
        fields: [
            { name: '', type: 'string' },
            { name: '', type: 'string' }
        ],
        items: []
    });

    const fieldTypes = ['string', 'number', 'boolean', 'date'];

    // Fetch datasets on mount
    useEffect(() => {
        fetchDatasets();
    }, []);

    const fetchDatasets = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminAPI.getDatasets();
            if (response.success) {
                setDatasets(response.datasets);
                // Select first dataset by default
                if (response.datasets.length > 0 && !selectedDataset) {
                    const fullDataset = await adminAPI.getDataset(response.datasets[0]._id);
                    if (fullDataset.success) {
                        setSelectedDataset(fullDataset.dataset);
                    }
                }
            } else {
                setError(response.error || 'Failed to fetch datasets');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch datasets');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectDataset = async (dataset) => {
        try {
            const response = await adminAPI.getDataset(dataset._id);
            if (response.success) {
                setSelectedDataset(response.dataset);
            }
        } catch (err) {
            console.error('Failed to fetch dataset:', err);
        }
    };

    // File upload handlers
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validTypes = [
            'application/json',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        const ext = file.name.split('.').pop().toLowerCase();
        const isValid = validTypes.includes(file.type) || ['json', 'csv', 'xlsx', 'xls'].includes(ext);

        if (!isValid) {
            alert('Please select a JSON, CSV, or Excel file');
            return;
        }

        setUploadFile(file);
        setUploadName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension

        // Preview for JSON files
        if (ext === 'json' || file.type === 'application/json') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const preview = Array.isArray(data) ? data.slice(0, 5) : [data];
                    setUploadPreview(preview);
                } catch (err) {
                    console.error('Error parsing JSON:', err);
                    setUploadPreview(null);
                }
            };
            reader.readAsText(file);
        } else if (ext === 'csv') {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const lines = e.target.result.split('\n').filter(l => l.trim());
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    const preview = lines.slice(1, 6).map(line => {
                        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                        const obj = {};
                        headers.forEach((h, i) => obj[h] = values[i] || '');
                        return obj;
                    });
                    setUploadPreview(preview);
                } catch (err) {
                    console.error('Error parsing CSV:', err);
                    setUploadPreview(null);
                }
            };
            reader.readAsText(file);
        } else {
            setUploadPreview(null);
        }
    };

    const handleUploadDataset = async () => {
        if (!uploadFile || !uploadName.trim()) {
            alert('Please select a file and provide a name');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('name', uploadName);
            formData.append('description', uploadDescription);

            const response = await adminAPI.uploadDataset(formData);

            if (response.success) {
                await fetchDatasets();
                const fullDataset = await adminAPI.getDataset(response.dataset._id);
                if (fullDataset.success) {
                    setSelectedDataset(fullDataset.dataset);
                }
                handleCloseModal();
            } else {
                setError(response.error || 'Failed to upload dataset');
            }
        } catch (err) {
            setError(err.message || 'Failed to upload dataset');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberOfFieldsChange = (e) => {
        const count = parseInt(e.target.value) || 1;
        const newFields = [];
        for (let i = 0; i < count; i++) {
            newFields.push(formData.fields[i] || { name: '', type: 'string' });
        }
        setFormData(prev => ({ ...prev, numberOfFields: count, fields: newFields }));
    };

    const handleInitialItemsChange = (e) => {
        const count = parseInt(e.target.value) || 1;
        setFormData(prev => ({ ...prev, initialItems: count }));
    };

    const handleFieldChange = (index, field, value) => {
        const newFields = [...formData.fields];
        newFields[index] = { ...newFields[index], [field]: value };
        setFormData(prev => ({ ...prev, fields: newFields }));
    };

    const handleItemChange = (itemIndex, fieldName, value) => {
        const newItems = [...formData.items];
        if (!newItems[itemIndex]) {
            newItems[itemIndex] = {};
        }
        newItems[itemIndex][fieldName] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleNextStep = () => {
        const items = [];
        for (let i = 0; i < formData.initialItems; i++) {
            const item = {};
            formData.fields.forEach(field => {
                item[field.name] = '';
            });
            items.push(item);
        }
        setFormData(prev => ({ ...prev, items }));
        setModalStep(2);
    };

    const handleBack = () => {
        setModalStep(1);
    };

    const handleCreateDataset = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await adminAPI.createDataset({
                name: formData.datasetName,
                description: formData.description,
                data: formData.items
            });

            if (response.success) {
                await fetchDatasets();
                const fullDataset = await adminAPI.getDataset(response.dataset._id);
                if (fullDataset.success) {
                    setSelectedDataset(fullDataset.dataset);
                }
                handleCloseModal();
            } else {
                setError(response.error || 'Failed to create dataset');
            }
        } catch (err) {
            setError(err.message || 'Failed to create dataset');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteDataset = async (datasetId) => {
        if (!confirm('Are you sure you want to delete this dataset?')) return;

        try {
            const response = await adminAPI.deleteDataset(datasetId);
            if (response.success) {
                await fetchDatasets();
                if (selectedDataset?._id === datasetId) {
                    setSelectedDataset(null);
                }
            } else {
                alert(response.error || 'Failed to delete dataset');
            }
        } catch (err) {
            alert(err.message || 'Failed to delete dataset');
        }
    };

    const handleOpenModal = (mode) => {
        setModalMode(mode);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setModalMode('manual');
        setUploadFile(null);
        setUploadPreview(null);
        setUploadName('');
        setUploadDescription('');
        setError(null);
        setFormData({
            datasetName: '',
            description: '',
            numberOfFields: 2,
            initialItems: 1,
            fields: [
                { name: '', type: 'string' },
                { name: '', type: 'string' }
            ],
            items: []
        });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'string':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'number':
                return 'bg-green-50 text-green-600 border-green-200';
            case 'boolean':
                return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'date':
                return 'bg-orange-50 text-orange-600 border-orange-200';
            default:
                return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    const getDatasetFields = (dataset) => {
        if (dataset.schema) {
            return Object.entries(dataset.schema).map(([name, type]) => ({ name, type }));
        }
        if (dataset.data && dataset.data.length > 0) {
            return Object.keys(dataset.data[0]).map(name => ({
                name,
                type: typeof dataset.data[0][name]
            }));
        }
        return [];
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading datasets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
                {error && (
                    <div className="text-sm text-red-500">{error}</div>
                )}
                <div className="flex-1"></div>
                <div className="flex items-center gap-2">
                    {/* Upload Button */}
                    <button
                        onClick={() => handleOpenModal('upload')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Upload File
                    </button>
                    {/* Manual Entry Button */}
                    <button
                        onClick={() => handleOpenModal('manual')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Dataset
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Datasets List */}
                <div className="w-56 border-r border-gray-200 bg-gray-50 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-200">
                        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Your Datasets</h3>
                    </div>
                    <div className="py-2">
                        {datasets.map(dataset => (
                            <div key={dataset._id} className="group relative">
                                <button
                                    onClick={() => handleSelectDataset(dataset)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all border-none cursor-pointer ${selectedDataset?._id === dataset._id
                                        ? 'bg-blue-50 border-l-[3px] border-l-blue-500 text-blue-600'
                                        : 'bg-transparent hover:bg-gray-100 text-gray-700 border-l-[3px] border-l-transparent'
                                        }`}
                                >
                                    <div>
                                        <div className={`text-sm font-medium ${selectedDataset?._id === dataset._id ? 'text-blue-600' : 'text-gray-900'}`}>
                                            {dataset.name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            {dataset.recordCount} records
                                            {dataset.fileType && (
                                                <span className="ml-1 text-gray-400">• {dataset.fileType.toUpperCase()}</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => handleDeleteDataset(dataset._id)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 bg-transparent border-none cursor-pointer transition-all"
                                    title="Delete dataset"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        ))}
                        {datasets.length === 0 && (
                            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                No datasets yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content - Dataset Details */}
                <div className="flex-1 overflow-auto bg-white p-6">
                    {selectedDataset ? (
                        <>
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedDataset.name}</h3>
                                    {selectedDataset.description && (
                                        <p className="text-sm text-gray-500 mb-2">{selectedDataset.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap max-h-20 overflow-y-auto">
                                        {getDatasetFields(selectedDataset).map((field, idx) => (
                                            <span
                                                key={idx}
                                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getTypeColor(field.type)}`}
                                            >
                                                {field.name}: <span className="ml-1 opacity-75">{field.type}</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {selectedDataset.recordCount} records
                                </div>
                            </div>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    {getDatasetFields(selectedDataset).length > 0 && (
                                        <table className="w-full min-w-max">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                                                        #
                                                    </th>
                                                    {getDatasetFields(selectedDataset).map((field, idx) => (
                                                        <th key={idx} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                                            {field.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {selectedDataset.data && selectedDataset.data.map((item, rowIdx) => (
                                                    <tr key={rowIdx} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="px-4 py-2.5 text-xs text-gray-400 font-mono sticky left-0 bg-white group-hover:bg-gray-50/50 z-10">
                                                            {rowIdx + 1}
                                                        </td>
                                                        {getDatasetFields(selectedDataset).map((field, colIdx) => (
                                                            <td key={colIdx} className="px-4 py-2.5 text-sm text-gray-700 font-mono whitespace-nowrap max-w-xs truncate" title={String(item[field.name] ?? '')}>
                                                                {String(item[field.name] ?? '')}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {(!selectedDataset.data || selectedDataset.data.length === 0) && (
                                        <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                            No records in this dataset
                                        </div>
                                    )}
                                </div>

                                {/* Footer with record count */}
                                {selectedDataset.data && selectedDataset.data.length > 0 && (
                                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                                        <span>
                                            Showing {selectedDataset.data.length} records • {getDatasetFields(selectedDataset).length} columns
                                        </span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center h-full">
                            <div className="text-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                                </svg>
                                <p className="text-lg font-medium text-gray-500">Select a dataset</p>
                                <p className="text-sm text-gray-400 mt-1">Choose a dataset from the sidebar to view its contents</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>

                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 z-10 max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {modalMode === 'upload' ? 'Upload Dataset' : 'Add New Dataset'}
                            </h2>
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

                        {/* Upload Mode */}
                        {modalMode === 'upload' && (
                            <div className="p-6 space-y-5 overflow-y-auto">
                                {/* File Drop Zone */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json,.csv,.xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    {uploadFile ? (
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-green-500 mb-2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14 2 14 8 20 8"></polyline>
                                                <polyline points="9 15 12 12 15 15"></polyline>
                                            </svg>
                                            <p className="text-sm font-medium text-gray-900">{uploadFile.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                            <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                            <p className="text-xs text-gray-500 mt-1">JSON, CSV, or Excel files</p>
                                        </div>
                                    )}
                                </div>

                                {/* Dataset Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        Dataset Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadName}
                                        onChange={(e) => setUploadName(e.target.value)}
                                        placeholder="e.g. Products Catalog"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadDescription}
                                        onChange={(e) => setUploadDescription(e.target.value)}
                                        placeholder="Brief description"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                {/* Preview */}
                                {uploadPreview && (
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                            Preview (First 5 rows)
                                        </label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-40 overflow-auto">
                                            <pre className="text-xs text-gray-600 font-mono">
                                                {JSON.stringify(uploadPreview, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="text-sm text-red-500">{error}</div>
                                )}

                                {/* Upload Button */}
                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleUploadDataset}
                                        disabled={!uploadFile || !uploadName.trim() || uploading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Dataset'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Manual Entry Mode - Step 1 */}
                        {modalMode === 'manual' && modalStep === 1 && (
                            <div className="p-6 space-y-5 overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        Dataset Name
                                    </label>
                                    <input
                                        type="text"
                                        name="datasetName"
                                        value={formData.datasetName}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Products v2"
                                        required
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of the dataset"
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                            Number of Fields
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={formData.numberOfFields}
                                            onChange={handleNumberOfFieldsChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                                            Initial Items
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="20"
                                            value={formData.initialItems}
                                            onChange={handleInitialItemsChange}
                                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                                        Field Definitions
                                    </label>
                                    <div className="space-y-3">
                                        {formData.fields.map((field, idx) => (
                                            <div key={idx} className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    placeholder={`Field ${idx + 1} Name`}
                                                    value={field.name}
                                                    onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                                                    className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                />
                                                <div className="relative w-32">
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm appearance-none cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    >
                                                        {fieldTypes.map(type => (
                                                            <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                                        ))}
                                                    </select>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                        <polyline points="6 9 12 15 18 9"></polyline>
                                                    </svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={handleNextStep}
                                        disabled={!formData.datasetName.trim() || formData.fields.some(f => !f.name.trim())}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Manual Entry Mode - Step 2 */}
                        {modalMode === 'manual' && modalStep === 2 && (
                            <form onSubmit={handleCreateDataset} className="p-6 space-y-5 overflow-y-auto">
                                <p className="text-sm text-gray-600">
                                    Enter the initial data for your <strong>{formData.initialItems}</strong> items.
                                </p>

                                <div className="space-y-4 max-h-80 overflow-y-auto">
                                    {formData.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="border border-gray-200 rounded-lg p-4">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                Item #{itemIdx + 1}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {formData.fields.map((field, fieldIdx) => (
                                                    <div key={fieldIdx}>
                                                        <label className="block text-xs text-gray-400 mb-1">
                                                            {field.name} ({field.type})
                                                        </label>
                                                        <input
                                                            type={field.type === 'number' ? 'number' : 'text'}
                                                            placeholder={field.name}
                                                            value={item[field.name] || ''}
                                                            onChange={(e) => handleItemChange(itemIdx, field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium cursor-pointer transition-all hover:bg-gray-50 hover:border-gray-400"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md disabled:opacity-50"
                                    >
                                        {saving ? 'Creating...' : 'Create Dataset & Items'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataManagement;
