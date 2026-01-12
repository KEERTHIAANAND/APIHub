const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'API key name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // The actual API key (hashed for security)
    keyHash: {
        type: String,
        required: true
    },
    // Prefix for display (e.g., "ak_xxxx")
    keyPrefix: {
        type: String,
        required: true
    },
    // Status
    status: {
        type: String,
        enum: ['active', 'revoked', 'expired'],
        default: 'active'
    },
    // Which endpoints this key can access
    endpoints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Endpoint'
    }],
    // Access level: 'all' means access to all endpoints, 'specific' means only listed endpoints
    accessLevel: {
        type: String,
        enum: ['all', 'specific'],
        default: 'specific'
    },
    // Assigned to a specific user (null = available to all users)
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    // Rate limiting
    rateLimit: {
        type: Number,
        default: 1000, // requests per hour
        min: 1
    },
    // Usage stats
    totalUsage: {
        type: Number,
        default: 0
    },
    lastUsed: {
        type: Date,
        default: null
    },
    // Expiration
    expiresAt: {
        type: Date,
        default: null // null = never expires
    },
    // Who created it
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
apiKeySchema.index({ keyHash: 1 }, { unique: true });
apiKeySchema.index({ keyPrefix: 1 });
apiKeySchema.index({ assignedTo: 1 });
apiKeySchema.index({ status: 1 });
apiKeySchema.index({ createdBy: 1 });

// Static method: Generate a new API key
apiKeySchema.statics.generateKey = function () {
    const key = 'ak_' + crypto.randomBytes(24).toString('hex');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const keyPrefix = key.substring(0, 10) + '...';

    return { key, keyHash, keyPrefix };
};

// Static method: Hash a key for lookup
apiKeySchema.statics.hashKey = function (key) {
    return crypto.createHash('sha256').update(key).digest('hex');
};

// Static method: Find by API key
apiKeySchema.statics.findByKey = async function (key) {
    const keyHash = this.hashKey(key);
    return this.findOne({ keyHash, status: 'active' })
        .populate('endpoints')
        .populate('assignedTo', 'name email');
};

// Method: Check if key can access an endpoint
apiKeySchema.methods.canAccessEndpoint = function (endpointId) {
    if (this.accessLevel === 'all') return true;
    return this.endpoints.some(ep => ep._id.toString() === endpointId.toString());
};

// Method: Record usage
apiKeySchema.methods.recordUsage = async function () {
    this.totalUsage += 1;
    this.lastUsed = new Date();
    await this.save();
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
