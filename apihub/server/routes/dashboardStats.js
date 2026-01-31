const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const Endpoint = require('../models/Endpoint');
const ApiKey = require('../models/ApiKey');
const RequestLog = require('../models/RequestLog');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/dashboard-stats
// @desc    Get dashboard overview stats
// @access  Admin only
router.get('/', async (req, res) => {
    try {
        // Get counts
        const activeEndpoints = await Endpoint.countDocuments({ isActive: true });
        const totalRequests = await RequestLog.countDocuments();

        // Get average latency
        const latencyAgg = await RequestLog.aggregate([
            { $group: { _id: null, avgLatency: { $avg: '$latency' } } }
        ]);
        const globalLatency = latencyAgg.length > 0 ? Math.round(latencyAgg[0].avgLatency) : 0;

        // Calculate error rate
        const errorCount = await RequestLog.countDocuments({ statusCode: { $gte: 400 } });
        const errorRate = totalRequests > 0 ? Math.round((errorCount / totalRequests) * 100) : 0;

        // Get status code distribution
        const statusAgg = await RequestLog.aggregate([
            {
                $group: {
                    _id: {
                        $cond: [
                            { $lt: ['$statusCode', 300] }, 'success',
                            { $cond: [{ $lt: ['$statusCode', 500] }, 'clientError', 'serverError'] }
                        ]
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusCodes = {
            success: 0,
            clientError: 0,
            serverError: 0
        };
        statusAgg.forEach(s => {
            if (s._id === 'success') statusCodes.success = s.count;
            else if (s._id === 'clientError') statusCodes.clientError = s.count;
            else if (s._id === 'serverError') statusCodes.serverError = s.count;
        });

        // Get traffic data for the last 24 hours (hourly buckets)
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const trafficAgg = await RequestLog.aggregate([
            { $match: { timestamp: { $gte: yesterday } } },
            {
                $group: {
                    _id: { $hour: '$timestamp' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Create hourly buckets
        const trafficData = [];
        for (let i = 0; i < 24; i += 4) {
            const hourData = trafficAgg.find(t => t._id === i);
            trafficData.push({
                time: `${String(i).padStart(2, '0')}:00`,
                value: hourData ? hourData.count : 0
            });
        }
        // Add last hour
        trafficData.push({ time: '23:59', value: trafficAgg.find(t => t._id === 23)?.count || 0 });

        res.json({
            success: true,
            stats: {
                totalRequests,
                globalLatency,
                activeEndpoints,
                errorRate
            },
            trafficData,
            statusCodes
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats'
        });
    }
});

module.exports = router;
