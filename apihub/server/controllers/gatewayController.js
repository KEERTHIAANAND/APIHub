const Endpoint = require('../models/Endpoint');
const Dataset = require('../models/Dataset');
const { logRequest } = require('../middleware/apiKeyAuth');

/**
 * Handle all dynamic API requests
 * Routes /api/v1/* to the appropriate dataset
 */
const handleApiRequest = async (req, res) => {
    // The endpoint path in database is stored as /api/v1/xxx
    // but since we're mounted at /api/v1, req.path is just /xxx
    const requestPath = '/api/v1' + req.path;
    const method = req.method;

    try {
        // Find matching endpoint
        const endpoint = await Endpoint.findOne({
            path: requestPath,
            method: method,
            isActive: true
        }).populate('datasetId');

        if (!endpoint) {
            await logRequest(req, res, 404, null);
            return res.status(404).json({
                success: false,
                error: `Endpoint ${method} ${requestPath} not found`
            });
        }

        // Check if API key has access to this endpoint
        const apiKey = req.apiKey;

        if (apiKey.accessLevel === 'specific') {
            const hasAccess = apiKey.canAccessEndpoint(endpoint._id);
            if (!hasAccess) {
                await logRequest(req, res, 403, endpoint._id);
                return res.status(403).json({
                    success: false,
                    error: 'API key does not have access to this endpoint'
                });
            }
        }

        // Get the dataset
        const dataset = endpoint.datasetId;
        if (!dataset || !dataset.isActive) {
            await logRequest(req, res, 404, endpoint._id);
            return res.status(404).json({
                success: false,
                error: 'Dataset not found or inactive'
            });
        }

        // Get query parameters for pagination and filtering
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(
            parseInt(req.query.limit) || endpoint.responseConfig?.pageSize || 10,
            100 // Max limit
        );
        const offset = (page - 1) * limit;

        console.log('📊 Gateway Request:', {
            path: requestPath,
            method,
            page,
            limit,
            query: req.query
        });

        // Get data from dataset
        let data = [...(dataset.data || [])];

        // Apply simple filtering if query params match field names
        const filterFields = Object.keys(req.query).filter(
            key => !['page', 'limit', 'sort', 'order'].includes(key)
        );

        console.log('🔍 Filter fields:', filterFields);

        filterFields.forEach(field => {
            const value = req.query[field];
            const beforeCount = data.length;

            data = data.filter(item => {
                // If item doesn't have this field, exclude it from filter results
                if (item[field] === undefined) return false;

                const itemValue = String(item[field]).toLowerCase();
                const searchValue = String(value).toLowerCase();
                return itemValue.includes(searchValue);
            });

            console.log(`   Filtered by ${field}=${value}: ${beforeCount} -> ${data.length} items`);
        });

        // Apply sorting if requested
        if (req.query.sort) {
            const sortField = req.query.sort;
            const sortOrder = req.query.order === 'desc' ? -1 : 1;
            data.sort((a, b) => {
                if (a[sortField] < b[sortField]) return -1 * sortOrder;
                if (a[sortField] > b[sortField]) return 1 * sortOrder;
                return 0;
            });
        }

        // Get total before pagination
        const total = data.length;

        // Apply pagination
        const paginatedData = endpoint.responseConfig?.paginate !== false
            ? data.slice(offset, offset + limit)
            : data;

        // Apply field filtering if configured
        let responseData = paginatedData;

        if (endpoint.responseConfig?.includeFields?.length > 0) {
            responseData = paginatedData.map(item => {
                const filtered = {};
                endpoint.responseConfig.includeFields.forEach(field => {
                    if (item[field] !== undefined) filtered[field] = item[field];
                });
                return filtered;
            });
        } else if (endpoint.responseConfig?.excludeFields?.length > 0) {
            responseData = paginatedData.map(item => {
                const filtered = { ...item };
                endpoint.responseConfig.excludeFields.forEach(field => {
                    delete filtered[field];
                });
                return filtered;
            });
        }

        // Update endpoint stats (don't wait)
        endpoint.totalRequests += 1;
        endpoint.lastAccessed = new Date();
        endpoint.save().catch(err => console.error('Error updating endpoint stats:', err));

        // Build response
        const response = {
            success: true,
            data: responseData
        };

        // Add pagination info if paginated
        if (endpoint.responseConfig?.paginate !== false) {
            response.pagination = {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: offset + limit < total,
                hasPrev: page > 1
            };
        }

        // Add metadata
        response.meta = {
            endpoint: endpoint.name,
            method: method,
            timestamp: new Date().toISOString()
        };

        // Send response FIRST
        res.json(response);

        // Log the request asynchronously (after response is sent)
        logRequest(req, res, 200, endpoint._id).catch(err =>
            console.error('Error logging request:', err)
        );

    } catch (error) {
        console.error('Gateway error:', error);
        await logRequest(req, res, 500, null);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

/**
 * Handle POST requests - could be used for creating data
 * For now, just returns the data (read-only API)
 */
const handlePostRequest = async (req, res) => {
    // For now, POST endpoints just return data like GET
    // In future, could implement data insertion
    return handleApiRequest(req, res);
};

/**
 * Get available endpoints (for documentation)
 */
const getAvailableEndpoints = async (req, res) => {
    try {
        const apiKey = req.apiKey;

        let endpoints;

        if (apiKey.accessLevel === 'all') {
            endpoints = await Endpoint.find({ isActive: true })
                .select('name description method path')
                .sort({ path: 1 });
        } else {
            endpoints = await Endpoint.find({
                _id: { $in: apiKey.endpoints },
                isActive: true
            })
                .select('name description method path')
                .sort({ path: 1 });
        }

        res.json({
            success: true,
            message: 'Available endpoints for your API key',
            endpoints: endpoints.map(ep => ({
                name: ep.name,
                description: ep.description,
                method: ep.method,
                path: ep.path,
                url: `${req.protocol}://${req.get('host')}${ep.path}`
            }))
        });
    } catch (error) {
        console.error('Error fetching endpoints:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch endpoints'
        });
    }
};

module.exports = {
    handleApiRequest,
    handlePostRequest,
    getAvailableEndpoints
};
