const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const RequestLog = require('../models/RequestLog');
const ApiKey = require('../models/ApiKey');
const Endpoint = require('../models/Endpoint');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/audit-logs
// @desc    Get all audit logs (request logs)
// @access  Admin only
router.get('/', async (req, res) => {
    try {
        const { limit = 100, page = 1, method, status, search } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build query filter
        const filter = {};

        if (method && method !== 'all') {
            filter.method = method;
        }

        if (status) {
            if (status === 'success') {
                filter.statusCode = { $gte: 200, $lt: 300 };
            } else if (status === 'client-error') {
                filter.statusCode = { $gte: 400, $lt: 500 };
            } else if (status === 'server-error') {
                filter.statusCode = { $gte: 500 };
            }
        }

        if (search) {
            filter.$or = [
                { path: { $regex: search, $options: 'i' } }
            ];
        }

        // Fetch logs with populated references
        const logs = await RequestLog.find(filter)
            .populate('apiKeyId', 'name keyPrefix')
            .populate('endpointId', 'name path')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await RequestLog.countDocuments(filter);

        // Format logs for frontend
        const formattedLogs = logs.map(log => ({
            id: log._id,
            timestamp: new Date(log.timestamp).toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }),
            code: log.statusCode,
            verb: log.method,
            endpointPath: log.path,
            context: log.endpointId?.name || 'Unknown',
            keyHash: log.apiKeyId?.keyPrefix || 'N/A',
            latency: log.latency,
            dataset: 'api' // Default dataset
        }));

        res.json({
            success: true,
            logs: formattedLogs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Get audit logs error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch audit logs'
        });
    }
});

module.exports = router;
