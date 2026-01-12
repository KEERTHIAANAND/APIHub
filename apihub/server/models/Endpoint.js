const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Endpoint name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // HTTP Method
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET'
    },
    // URL path (e.g., /api/v1/products)
    path: {
        type: String,
        required: [true, 'Endpoint path is required'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^\/[a-zA-Z0-9\-_\/]*$/.test(v);
            },
            message: 'Path must start with / and contain only letters, numbers, hyphens, underscores'
        }
    },
    // Which dataset this endpoint serves
    datasetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dataset',
        required: [true, 'Dataset is required']
    },
    // Response configuration
    responseConfig: {
        // Whether to return paginated results
        paginate: {
            type: Boolean,
            default: true
        },
        // Default page size
        pageSize: {
            type: Number,
            default: 10,
            min: 1,
            max: 100
        },
        // Fields to include (empty = all)
        includeFields: [{
            type: String
        }],
        // Fields to exclude
        excludeFields: [{
            type: String
        }]
    },
    // Rate limiting for this endpoint
    rateLimit: {
        type: Number,
        default: 1000, // requests per hour
        min: 1
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
    },
    // Stats
    totalRequests: {
        type: Number,
        default: 0
    },
    lastAccessed: {
        type: Date,
        default: null
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

// Compound index for unique path per method
endpointSchema.index({ path: 1, method: 1 }, { unique: true });
endpointSchema.index({ datasetId: 1 });
endpointSchema.index({ createdBy: 1 });

// Pre-save: Ensure path starts with /api/v1/
endpointSchema.pre('save', function (next) {
    if (!this.path.startsWith('/api/v1/')) {
        // Auto-prepend if not present
        if (this.path.startsWith('/')) {
            this.path = '/api/v1' + this.path;
        } else {
            this.path = '/api/v1/' + this.path;
        }
    }
    next();
});

module.exports = mongoose.model('Endpoint', endpointSchema);
