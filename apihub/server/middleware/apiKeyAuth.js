const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');

/**
 * Middleware to validate API keys for the gateway
 * Extracts and validates the X-API-Key header
 */
const validateApiKey = async (req, res, next) => {
    const startTime = Date.now();

    // Get API key from header
    const apiKeyHeader = req.headers['x-api-key'];

    if (!apiKeyHeader) {
        return res.status(401).json({
            success: false,
            error: 'API key is required. Include X-API-Key header.'
        });
    }

    try {
        // Find the API key
        const apiKey = await ApiKey.findByKey(apiKeyHeader);

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: 'Invalid API key'
            });
        }

        // Check if key is active
        if (apiKey.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'API key has been revoked'
            });
        }

        // Check if key is expired
        if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
            return res.status(403).json({
                success: false,
                error: 'API key has expired'
            });
        }

        // TODO: Implement proper rate limiting with Redis
        // For now, we'll skip rate limiting or use a simple in-memory approach

        // Attach API key info to request
        req.apiKey = apiKey;
        req.requestStartTime = startTime;

        next();
    } catch (error) {
        console.error('API Key validation error:', error);
        return res.status(500).json({
            success: false,
            error: 'Error validating API key'
        });
    }
};

/**
 * Middleware to log API requests
 * Should be called after the response is sent
 */
const logRequest = async (req, res, statusCode, endpointId = null) => {
    try {
        const latency = Date.now() - req.requestStartTime;

        await RequestLog.logRequest({
            apiKeyId: req.apiKey._id,
            endpointId: endpointId,
            userId: req.apiKey.assignedTo?._id || null,
            method: req.method,
            path: req.path,
            queryParams: req.query,
            statusCode: statusCode,
            latency: latency,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers['user-agent']
        });

        // Update API key usage
        await req.apiKey.recordUsage();
    } catch (error) {
        console.error('Error logging request:', error);
        // Don't throw - logging failure shouldn't break the response
    }
};

module.exports = { validateApiKey, logRequest };
