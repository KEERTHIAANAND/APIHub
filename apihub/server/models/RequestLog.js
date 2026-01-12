const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
    // Which API key was used
    apiKeyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApiKey',
        required: true
    },
    // Which endpoint was accessed
    endpointId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Endpoint',
        default: null
    },
    // User who owns the API key
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Request details
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        required: true
    },
    path: {
        type: String,
        required: true
    },
    // Query parameters
    queryParams: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Response details
    statusCode: {
        type: Number,
        required: true
    },
    // Response time in milliseconds
    latency: {
        type: Number,
        required: true
    },
    // Request metadata
    ipAddress: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    // Error message if any
    errorMessage: {
        type: String,
        default: null
    },
    // Timestamp
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: false // We use our own timestamp field
});

// Indexes for efficient querying
requestLogSchema.index({ apiKeyId: 1, timestamp: -1 });
requestLogSchema.index({ userId: 1, timestamp: -1 });
requestLogSchema.index({ endpointId: 1, timestamp: -1 });
requestLogSchema.index({ statusCode: 1 });

// TTL index - automatically delete logs older than 30 days (optional)
// requestLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Static method: Log a request
requestLogSchema.statics.logRequest = async function (data) {
    const log = new this(data);
    await log.save();
    return log;
};

// Static method: Get stats for an API key
requestLogSchema.statics.getKeyStats = async function (apiKeyId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.aggregate([
        {
            $match: {
                apiKeyId: new mongoose.Types.ObjectId(apiKeyId),
                timestamp: { $gte: startDate }
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

    if (stats.length === 0) {
        return {
            totalRequests: 0,
            avgLatency: 0,
            successRate: 0,
            errorCount: 0
        };
    }

    const result = stats[0];
    return {
        totalRequests: result.totalRequests,
        avgLatency: Math.round(result.avgLatency),
        successRate: result.totalRequests > 0
            ? Math.round((result.successCount / result.totalRequests) * 100 * 10) / 10
            : 0,
        errorCount: result.errorCount
    };
};

// Static method: Get stats for a user
requestLogSchema.statics.getUserStats = async function (userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: null,
                totalRequests: { $sum: 1 },
                avgLatency: { $avg: '$latency' },
                successCount: {
                    $sum: { $cond: [{ $lt: ['$statusCode', 400] }, 1, 0] }
                }
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            totalRequests: 0,
            avgLatency: 0,
            successRate: 0
        };
    }

    const result = stats[0];
    return {
        totalRequests: result.totalRequests,
        avgLatency: Math.round(result.avgLatency),
        successRate: result.totalRequests > 0
            ? Math.round((result.successCount / result.totalRequests) * 100 * 10) / 10
            : 0
    };
};

module.exports = mongoose.model('RequestLog', requestLogSchema);
