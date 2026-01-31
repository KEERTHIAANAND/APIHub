const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');
const Endpoint = require('../models/Endpoint');

/**
 * Get all active API keys (visible to all developers)
 * All keys are public unless admin makes them private
 */
const getMyApiKeys = async (req, res) => {
    try {
        // Get ALL active API keys (not filtered by user)
        const apiKeys = await ApiKey.find({ status: 'active' })
            .populate('endpoints', 'name path method')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: apiKeys.length,
            apiKeys: apiKeys.map(key => ({
                _id: key._id,
                name: key.name,
                description: key.description,
                fullKey: key.fullKey, // Full key for copying
                keyPrefix: key.keyPrefix,
                status: key.status,
                accessLevel: key.accessLevel,
                endpoints: key.endpoints,
                rateLimit: key.rateLimit,
                totalUsage: key.totalUsage,
                lastUsedAt: key.lastUsedAt,
                expiresAt: key.expiresAt,
                createdAt: key.createdAt
            }))
        });
    } catch (error) {
        console.error('Get API keys error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch API keys'
        });
    }
};

/**
 * Get usage stats (all API usage - public stats)
 */
const getMyStats = async (req, res) => {
    try {
        // Get ALL active API keys
        const apiKeys = await ApiKey.find({ status: 'active' });
        const apiKeyIds = apiKeys.map(k => k._id);

        // Get request logs for all keys
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const stats = await RequestLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRequests: { $sum: 1 },
                    avgLatency: { $avg: '$latency' },
                    successCount: {
                        $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
                    },
                    errorCount: {
                        $sum: { $cond: [{ $gte: ['$statusCode', 400] }, 1, 0] }
                    }
                }
            }
        ]);

        // Get daily usage for chart
        const dailyUsage = await RequestLog.aggregate([
            {
                $match: {
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const result = stats.length > 0 ? stats[0] : {
            totalRequests: 0,
            avgLatency: 0,
            successCount: 0,
            errorCount: 0
        };

        res.json({
            success: true,
            stats: {
                totalRequests: result.totalRequests,
                avgLatency: Math.round(result.avgLatency || 0),
                successRate: result.totalRequests > 0
                    ? Math.round((result.successCount / result.totalRequests) * 100)
                    : 0,
                errorCount: result.errorCount,
                activeKeys: apiKeys.length,
                totalKeys: apiKeys.length
            },
            dailyUsage: dailyUsage.map(d => ({
                date: d._id,
                count: d.count
            }))
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stats'
        });
    }
};

/**
 * Get recent request history (all API requests)
 */
const getMyRequestHistory = async (req, res) => {
    try {
        const { limit = 50, page = 1 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await RequestLog.find({})
            .populate('apiKeyId', 'name keyPrefix')
            .populate('endpointId', 'name path')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await RequestLog.countDocuments({});

        res.json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            logs: logs.map(log => ({
                _id: log._id,
                method: log.method,
                path: log.path,
                statusCode: log.statusCode,
                latency: log.latency,
                timestamp: log.timestamp,
                apiKeyName: log.apiKeyId?.name,
                endpointName: log.endpointId?.name
            }))
        });
    } catch (error) {
        console.error('Get request history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch request history'
        });
    }
};

/**
 * Get all available endpoints
 */
const getMyEndpoints = async (req, res) => {
    try {
        // Get all active endpoints
        const endpoints = await Endpoint.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: endpoints.length,
            endpoints: endpoints.map(ep => ({
                _id: ep._id,
                name: ep.name,
                description: ep.description,
                method: ep.method,
                path: ep.path
            }))
        });
    } catch (error) {
        console.error('Get endpoints error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch endpoints'
        });
    }
};

/**
 * Clear all request history
 */
const clearRequestHistory = async (req, res) => {
    try {
        // Delete all request logs
        const result = await RequestLog.deleteMany({});

        res.json({
            success: true,
            message: 'Request history cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Clear request history error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to clear request history'
        });
    }
};

module.exports = {
    getMyApiKeys,
    getMyStats,
    getMyRequestHistory,
    getMyEndpoints,
    clearRequestHistory
};
