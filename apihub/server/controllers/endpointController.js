const Endpoint = require('../models/Endpoint');
const Dataset = require('../models/Dataset');
const ApiKey = require('../models/ApiKey');

// @desc    Get all endpoints
// @route   GET /api/admin/endpoints
// @access  Private/Admin
const getEndpoints = async (req, res, next) => {
    try {
        const endpoints = await Endpoint.find({ createdBy: req.user._id })
            .populate('datasetId', 'name recordCount')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: endpoints.length,
            endpoints
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single endpoint
// @route   GET /api/admin/endpoints/:id
// @access  Private/Admin
const getEndpoint = async (req, res, next) => {
    try {
        const endpoint = await Endpoint.findById(req.params.id)
            .populate('datasetId', 'name recordCount schema');

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                error: 'Endpoint not found'
            });
        }

        res.json({
            success: true,
            endpoint
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create endpoint
// @route   POST /api/admin/endpoints
// @access  Private/Admin
const createEndpoint = async (req, res, next) => {
    try {
        const { name, description, method, path, datasetId, responseConfig, rateLimit } = req.body;

        // Validate required fields
        if (!name || !path || !datasetId) {
            return res.status(400).json({
                success: false,
                error: 'Name, path, and dataset are required'
            });
        }

        // Check if dataset exists
        const dataset = await Dataset.findById(datasetId);
        if (!dataset) {
            return res.status(404).json({
                success: false,
                error: 'Dataset not found'
            });
        }

        // Check if path already exists for this method
        let fullPath = path;
        if (!fullPath.startsWith('/api/v1/')) {
            fullPath = '/api/v1' + (fullPath.startsWith('/') ? fullPath : '/' + fullPath);
        }

        const existingEndpoint = await Endpoint.findOne({
            path: fullPath,
            method: method || 'GET'
        });

        if (existingEndpoint) {
            return res.status(400).json({
                success: false,
                error: `Endpoint ${method || 'GET'} ${fullPath} already exists`
            });
        }

        const endpoint = await Endpoint.create({
            name,
            description,
            method: method || 'GET',
            path,
            datasetId,
            responseConfig: responseConfig || {},
            rateLimit: rateLimit || 1000,
            createdBy: req.user._id
        });

        await endpoint.populate('datasetId', 'name recordCount');

        res.status(201).json({
            success: true,
            endpoint
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'An endpoint with this path and method already exists'
            });
        }
        next(error);
    }
};

// @desc    Update endpoint
// @route   PUT /api/admin/endpoints/:id
// @access  Private/Admin
const updateEndpoint = async (req, res, next) => {
    try {
        const { name, description, method, path, datasetId, responseConfig, rateLimit, isActive } = req.body;

        let endpoint = await Endpoint.findById(req.params.id);

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                error: 'Endpoint not found'
            });
        }

        // If changing dataset, verify it exists
        if (datasetId && datasetId !== endpoint.datasetId.toString()) {
            const dataset = await Dataset.findById(datasetId);
            if (!dataset) {
                return res.status(404).json({
                    success: false,
                    error: 'Dataset not found'
                });
            }
            endpoint.datasetId = datasetId;
        }

        // Update fields
        if (name) endpoint.name = name;
        if (description !== undefined) endpoint.description = description;
        if (method) endpoint.method = method;
        if (path) endpoint.path = path;
        if (responseConfig) endpoint.responseConfig = { ...endpoint.responseConfig, ...responseConfig };
        if (rateLimit) endpoint.rateLimit = rateLimit;
        if (isActive !== undefined) endpoint.isActive = isActive;

        await endpoint.save();
        await endpoint.populate('datasetId', 'name recordCount');

        res.json({
            success: true,
            endpoint
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'An endpoint with this path and method already exists'
            });
        }
        next(error);
    }
};

// @desc    Delete endpoint
// @route   DELETE /api/admin/endpoints/:id
// @access  Private/Admin
const deleteEndpoint = async (req, res, next) => {
    try {
        const endpoint = await Endpoint.findById(req.params.id);

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                error: 'Endpoint not found'
            });
        }

        // Remove this endpoint from all API keys
        await ApiKey.updateMany(
            { endpoints: endpoint._id },
            { $pull: { endpoints: endpoint._id } }
        );

        await endpoint.deleteOne();

        res.json({
            success: true,
            message: 'Endpoint deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle endpoint status (active/inactive)
// @route   PATCH /api/admin/endpoints/:id/toggle
// @access  Private/Admin
const toggleEndpoint = async (req, res, next) => {
    try {
        const endpoint = await Endpoint.findById(req.params.id);

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                error: 'Endpoint not found'
            });
        }

        endpoint.isActive = !endpoint.isActive;
        await endpoint.save();

        res.json({
            success: true,
            isActive: endpoint.isActive,
            message: `Endpoint ${endpoint.isActive ? 'activated' : 'deactivated'}`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Test endpoint (preview data)
// @route   GET /api/admin/endpoints/:id/test
// @access  Private/Admin
const testEndpoint = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const endpoint = await Endpoint.findById(req.params.id)
            .populate('datasetId');

        if (!endpoint) {
            return res.status(404).json({
                success: false,
                error: 'Endpoint not found'
            });
        }

        if (!endpoint.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Endpoint is not active'
            });
        }

        const dataset = endpoint.datasetId;
        if (!dataset) {
            return res.status(404).json({
                success: false,
                error: 'Dataset not found'
            });
        }

        // Apply pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        let data = dataset.data.slice(startIndex, endIndex);

        // Apply field filtering
        if (endpoint.responseConfig.includeFields && endpoint.responseConfig.includeFields.length > 0) {
            data = data.map(item => {
                const filtered = {};
                endpoint.responseConfig.includeFields.forEach(field => {
                    if (item[field] !== undefined) filtered[field] = item[field];
                });
                return filtered;
            });
        } else if (endpoint.responseConfig.excludeFields && endpoint.responseConfig.excludeFields.length > 0) {
            data = data.map(item => {
                const filtered = { ...item };
                endpoint.responseConfig.excludeFields.forEach(field => {
                    delete filtered[field];
                });
                return filtered;
            });
        }

        res.json({
            success: true,
            endpoint: {
                method: endpoint.method,
                path: endpoint.path
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: dataset.recordCount,
                pages: Math.ceil(dataset.recordCount / parseInt(limit))
            },
            data
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getEndpoints,
    getEndpoint,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    toggleEndpoint,
    testEndpoint
};
