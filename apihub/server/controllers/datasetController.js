const Dataset = require('../models/Dataset');
const Endpoint = require('../models/Endpoint');

// @desc    Get all datasets
// @route   GET /api/admin/datasets
// @access  Private/Admin
const getDatasets = async (req, res, next) => {
    try {
        const datasets = await Dataset.find({ createdBy: req.user._id })
            .select('-data') // Don't include the actual data in list view
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: datasets.length,
            datasets
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single dataset
// @route   GET /api/admin/datasets/:id
// @access  Private/Admin
const getDataset = async (req, res, next) => {
    try {
        const dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            return res.status(404).json({
                success: false,
                error: 'Dataset not found'
            });
        }

        res.json({
            success: true,
            dataset
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create dataset manually (JSON input)
// @route   POST /api/admin/datasets
// @access  Private/Admin
const createDataset = async (req, res, next) => {
    try {
        const { name, description, data } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Dataset name is required'
            });
        }

        // Parse data if it's a string
        let parsedData = data;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON data'
                });
            }
        }

        // Ensure data is an array
        if (!Array.isArray(parsedData)) {
            parsedData = [parsedData];
        }

        // Extract schema from first record
        let schema = null;
        if (parsedData.length > 0) {
            schema = Object.keys(parsedData[0]).reduce((acc, key) => {
                acc[key] = typeof parsedData[0][key];
                return acc;
            }, {});
        }

        const dataset = await Dataset.create({
            name,
            description,
            data: parsedData,
            schema,
            recordCount: parsedData.length,
            fileType: 'manual',
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            dataset: {
                _id: dataset._id,
                name: dataset.name,
                description: dataset.description,
                recordCount: dataset.recordCount,
                schema: dataset.schema,
                createdAt: dataset.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload dataset file (JSON/CSV)
// @route   POST /api/admin/datasets/upload
// @access  Private/Admin
const uploadDataset = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a file'
            });
        }

        let parsedData = [];
        const fileContent = req.file.buffer.toString('utf-8');
        const fileType = req.file.originalname.endsWith('.csv') ? 'csv' : 'json';

        if (fileType === 'json') {
            try {
                parsedData = JSON.parse(fileContent);
                if (!Array.isArray(parsedData)) {
                    parsedData = [parsedData];
                }
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON file'
                });
            }
        } else if (fileType === 'csv') {
            // Simple CSV parsing
            const lines = fileContent.trim().split('\n');
            if (lines.length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'CSV file must have headers and at least one row'
                });
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const row = {};
                headers.forEach((header, index) => {
                    let value = values[index] || '';
                    // Try to parse numbers
                    if (!isNaN(value) && value !== '') {
                        value = parseFloat(value);
                    }
                    row[header] = value;
                });
                parsedData.push(row);
            }
        }

        // Extract schema
        let schema = null;
        if (parsedData.length > 0) {
            schema = Object.keys(parsedData[0]).reduce((acc, key) => {
                acc[key] = typeof parsedData[0][key];
                return acc;
            }, {});
        }

        const dataset = await Dataset.create({
            name: name || req.file.originalname.replace(/\.[^/.]+$/, ''),
            description,
            data: parsedData,
            schema,
            recordCount: parsedData.length,
            fileType,
            originalFileName: req.file.originalname,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            dataset: {
                _id: dataset._id,
                name: dataset.name,
                description: dataset.description,
                recordCount: dataset.recordCount,
                schema: dataset.schema,
                fileType: dataset.fileType,
                createdAt: dataset.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update dataset
// @route   PUT /api/admin/datasets/:id
// @access  Private/Admin
const updateDataset = async (req, res, next) => {
    try {
        const { name, description, data, isActive } = req.body;

        let dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            return res.status(404).json({
                success: false,
                error: 'Dataset not found'
            });
        }

        // Update fields
        if (name) dataset.name = name;
        if (description !== undefined) dataset.description = description;
        if (isActive !== undefined) dataset.isActive = isActive;

        if (data) {
            let parsedData = data;
            if (typeof data === 'string') {
                try {
                    parsedData = JSON.parse(data);
                } catch (e) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid JSON data'
                    });
                }
            }
            if (!Array.isArray(parsedData)) {
                parsedData = [parsedData];
            }
            dataset.data = parsedData;
            dataset.recordCount = parsedData.length;

            // Update schema
            if (parsedData.length > 0) {
                dataset.schema = Object.keys(parsedData[0]).reduce((acc, key) => {
                    acc[key] = typeof parsedData[0][key];
                    return acc;
                }, {});
            }
        }

        await dataset.save();

        res.json({
            success: true,
            dataset: {
                _id: dataset._id,
                name: dataset.name,
                description: dataset.description,
                recordCount: dataset.recordCount,
                schema: dataset.schema,
                isActive: dataset.isActive,
                updatedAt: dataset.updatedAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete dataset
// @route   DELETE /api/admin/datasets/:id
// @access  Private/Admin
const deleteDataset = async (req, res, next) => {
    try {
        const dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            return res.status(404).json({
                success: false,
                error: 'Dataset not found'
            });
        }

        // Check if any endpoints use this dataset
        const endpointCount = await Endpoint.countDocuments({ datasetId: dataset._id });
        if (endpointCount > 0) {
            return res.status(400).json({
                success: false,
                error: `Cannot delete: ${endpointCount} endpoint(s) are using this dataset. Delete them first.`
            });
        }

        await dataset.deleteOne();

        res.json({
            success: true,
            message: 'Dataset deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get dataset data (preview)
// @route   GET /api/admin/datasets/:id/data
// @access  Private/Admin
const getDatasetData = async (req, res, next) => {
    try {
        const { limit = 10, offset = 0 } = req.query;

        const dataset = await Dataset.findById(req.params.id);

        if (!dataset) {
            return res.status(404).json({
                success: false,
                error: 'Dataset not found'
            });
        }

        const data = dataset.data.slice(
            parseInt(offset),
            parseInt(offset) + parseInt(limit)
        );

        res.json({
            success: true,
            total: dataset.recordCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            data
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDatasets,
    getDataset,
    createDataset,
    uploadDataset,
    updateDataset,
    deleteDataset,
    getDatasetData
};
