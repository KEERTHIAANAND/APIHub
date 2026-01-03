import { useState } from 'react';

const DataManagement = () => {
    const [showModal, setShowModal] = useState(false);
    const [modalStep, setModalStep] = useState(1);
    const [selectedDataset, setSelectedDataset] = useState(null);

    // Datasets state - empty by default, will be populated when datasets are created
    const [datasets, setDatasets] = useState([]);

    // Form state for new dataset
    const [formData, setFormData] = useState({
        datasetName: '',
        numberOfFields: 2,
        initialItems: 1,
        fields: [
            { name: '', type: 'string' },
            { name: '', type: 'string' }
        ],
        items: []
    });

    const fieldTypes = ['string', 'number', 'boolean', 'date'];

    // Select first dataset by default
    useState(() => {
        if (datasets.length > 0 && !selectedDataset) {
            setSelectedDataset(datasets[0]);
        }
    });

    const handleSelectDataset = (dataset) => {
        setSelectedDataset(dataset);
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
        // Initialize items array based on initialItems count
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

    const handleCreateDataset = (e) => {
        e.preventDefault();

        const newDataset = {
            id: Date.now(),
            name: formData.datasetName,
            fields: formData.fields.filter(f => f.name.trim() !== ''),
            items: formData.items,
            updated: new Date().toISOString().split('T')[0]
        };

        setDatasets(prev => [...prev, newDataset]);
        setSelectedDataset(newDataset);
        handleCloseModal();
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setModalStep(1);
        setFormData({
            datasetName: '',
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

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            {/* Header - Only Add Dataset Button */}
            <div className="flex items-center justify-end px-6 py-3 border-b border-gray-200 bg-white">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Dataset
                </button>
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
                            <button
                                key={dataset.id}
                                onClick={() => handleSelectDataset(dataset)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all border-none cursor-pointer ${selectedDataset?.id === dataset.id
                                        ? 'bg-blue-50 border-l-[3px] border-l-blue-500 text-blue-600'
                                        : 'bg-transparent hover:bg-gray-100 text-gray-700 border-l-[3px] border-l-transparent'
                                    }`}
                            >
                                <div>
                                    <div className={`text-sm font-medium ${selectedDataset?.id === dataset.id ? 'text-blue-600' : 'text-gray-900'}`}>
                                        {dataset.name}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {dataset.items.length} records
                                    </div>
                                </div>
                                {selectedDataset?.id === dataset.id && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                )}
                            </button>
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
                            {/* Dataset Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedDataset.name}</h3>
                                    <div className="flex items-center gap-2">
                                        {selectedDataset.fields.map((field, idx) => (
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
                                    Updated: {selectedDataset.updated}
                                </div>
                            </div>

                            {/* Dataset Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Table Header */}
                                <div
                                    className="grid gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200"
                                    style={{ gridTemplateColumns: `repeat(${selectedDataset.fields.length}, 1fr)` }}
                                >
                                    {selectedDataset.fields.map((field, idx) => (
                                        <div key={idx} className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                            {field.name}
                                        </div>
                                    ))}
                                </div>

                                {/* Table Body */}
                                {selectedDataset.items.map((item, rowIdx) => (
                                    <div
                                        key={rowIdx}
                                        className="grid gap-4 px-5 py-3 border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                                        style={{ gridTemplateColumns: `repeat(${selectedDataset.fields.length}, 1fr)` }}
                                    >
                                        {selectedDataset.fields.map((field, colIdx) => (
                                            <div key={colIdx} className="text-sm text-gray-700 font-mono">
                                                {String(item[field.name])}
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                {selectedDataset.items.length === 0 && (
                                    <div className="px-5 py-8 text-center text-gray-400 text-sm">
                                        No records in this dataset
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

            {/* Add Dataset Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    ></div>

                    {/* Modal */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Add New Dataset <span className="text-gray-400 font-normal">// Step {modalStep}</span>
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

                        {/* Modal Body - Step 1 */}
                        {modalStep === 1 && (
                            <div className="p-6 space-y-5">
                                {/* Dataset Name */}
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

                                {/* Number of Fields and Initial Items Row */}
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

                                {/* Field Definitions */}
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

                                {/* Next Button */}
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

                        {/* Modal Body - Step 2 */}
                        {modalStep === 2 && (
                            <form onSubmit={handleCreateDataset} className="p-6 space-y-5">
                                <p className="text-sm text-gray-600">
                                    Enter the initial data for your <strong>{formData.initialItems}</strong> items.
                                </p>

                                {/* Items */}
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
                                                            ({field.type})
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

                                {/* Footer Buttons */}
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
                                        className="px-6 py-2.5 bg-blue-500 border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-blue-600 shadow-sm hover:shadow-md"
                                    >
                                        Create Dataset & Items
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
