const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dataset name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    // The actual data stored as JSON array
    data: {
        type: Array,
        default: []
    },
    // Data schema/structure info
    schema: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    // Metadata
    recordCount: {
        type: Number,
        default: 0
    },
    fileType: {
        type: String,
        enum: ['json', 'csv', 'manual'],
        default: 'manual'
    },
    originalFileName: {
        type: String,
        default: null
    },
    // Status
    isActive: {
        type: Boolean,
        default: true
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

// Index for faster queries
datasetSchema.index({ createdBy: 1 });
datasetSchema.index({ name: 'text', description: 'text' });

// Virtual for endpoint count
datasetSchema.virtual('endpointCount', {
    ref: 'Endpoint',
    localField: '_id',
    foreignField: 'datasetId',
    count: true
});

// Ensure virtuals are included in JSON
datasetSchema.set('toJSON', { virtuals: true });
datasetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Dataset', datasetSchema);
