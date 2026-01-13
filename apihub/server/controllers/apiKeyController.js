const ApiKey = require('../models/ApiKey');
const Endpoint = require('../models/Endpoint');
const User = require('../models/User');

// @desc    Get all API keys
// @route   GET /api/admin/access-keys
// @access  Private/Admin
const getApiKeys = async (req, res, next) => {
    try {
        const apiKeys = await ApiKey.find({ createdBy: req.user._id })
            .populate('endpoints', 'name method path')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: apiKeys.length,
            apiKeys
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single API key
// @route   GET /api/admin/access-keys/:id
// @access  Private/Admin
const getApiKey = async (req, res, next) => {
    try {
        const apiKey = await ApiKey.findById(req.params.id)
            .populate('endpoints', 'name method path isActive')
            .populate('assignedTo', 'name email');

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        res.json({
            success: true,
            apiKey
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Generate new API key
// @route   POST /api/admin/access-keys/generate
// @access  Private/Admin
const generateApiKey = async (req, res, next) => {
    try {
        const { name, description, endpoints, accessLevel, assignedTo, rateLimit, expiresAt } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'API key name is required'
            });
        }

        // Validate endpoints if provided and accessLevel is 'specific'
        if (accessLevel === 'specific' && endpoints && endpoints.length > 0) {
            const validEndpoints = await Endpoint.find({ _id: { $in: endpoints } });
            if (validEndpoints.length !== endpoints.length) {
                return res.status(400).json({
                    success: false,
                    error: 'One or more endpoints are invalid'
                });
            }
        }

        // Validate assigned user if provided
        if (assignedTo) {
            const user = await User.findById(assignedTo);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    error: 'Assigned user not found'
                });
            }
        }

        // Generate the key
        const { key, keyHash, keyPrefix } = ApiKey.generateKey();

        const apiKey = await ApiKey.create({
            name,
            description,
            keyHash,
            fullKey: key, // Store full key for team sharing
            keyPrefix,
            endpoints: accessLevel === 'specific' ? endpoints : [],
            accessLevel: accessLevel || 'specific',
            assignedTo: assignedTo || null,
            rateLimit: rateLimit || 1000,
            expiresAt: expiresAt || null,
            createdBy: req.user._id
        });

        await apiKey.populate('endpoints', 'name method path');
        await apiKey.populate('assignedTo', 'name email');

        res.status(201).json({
            success: true,
            message: 'API key generated successfully. Save the key now - it won\'t be shown again!',
            apiKey: {
                _id: apiKey._id,
                name: apiKey.name,
                description: apiKey.description,
                key: key, // Only time the full key is returned!
                keyPrefix: apiKey.keyPrefix,
                status: apiKey.status,
                endpoints: apiKey.endpoints,
                accessLevel: apiKey.accessLevel,
                assignedTo: apiKey.assignedTo,
                rateLimit: apiKey.rateLimit,
                expiresAt: apiKey.expiresAt,
                createdAt: apiKey.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update API key
// @route   PUT /api/admin/access-keys/:id
// @access  Private/Admin
const updateApiKey = async (req, res, next) => {
    try {
        const { name, description, endpoints, accessLevel, assignedTo, rateLimit, status, expiresAt } = req.body;

        let apiKey = await ApiKey.findById(req.params.id);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        // Update fields
        if (name) apiKey.name = name;
        if (description !== undefined) apiKey.description = description;
        if (accessLevel) apiKey.accessLevel = accessLevel;
        if (endpoints) apiKey.endpoints = endpoints;
        if (assignedTo !== undefined) apiKey.assignedTo = assignedTo || null;
        if (rateLimit) apiKey.rateLimit = rateLimit;
        if (status) apiKey.status = status;
        if (expiresAt !== undefined) apiKey.expiresAt = expiresAt || null;

        await apiKey.save();
        await apiKey.populate('endpoints', 'name method path');
        await apiKey.populate('assignedTo', 'name email');

        res.json({
            success: true,
            apiKey
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Revoke API key
// @route   PATCH /api/admin/access-keys/:id/revoke
// @access  Private/Admin
const revokeApiKey = async (req, res, next) => {
    try {
        const apiKey = await ApiKey.findById(req.params.id);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        apiKey.status = apiKey.status === 'revoked' ? 'active' : 'revoked';
        await apiKey.save();

        res.json({
            success: true,
            status: apiKey.status,
            message: `API key ${apiKey.status === 'revoked' ? 'revoked' : 'activated'}`
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Regenerate API key
// @route   PATCH /api/admin/access-keys/:id/regenerate
// @access  Private/Admin
const regenerateApiKey = async (req, res, next) => {
    try {
        const apiKey = await ApiKey.findById(req.params.id);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        // Generate new key
        const { key, keyHash, keyPrefix } = ApiKey.generateKey();

        apiKey.keyHash = keyHash;
        apiKey.fullKey = key; // Store full key
        apiKey.keyPrefix = keyPrefix;
        apiKey.status = 'active'; // Re-activate if revoked
        apiKey.totalUsage = 0; // Reset usage

        await apiKey.save();
        await apiKey.populate('endpoints', 'name method path');
        await apiKey.populate('assignedTo', 'name email');

        res.json({
            success: true,
            message: 'API key regenerated. Save the new key now - it won\'t be shown again!',
            apiKey: {
                _id: apiKey._id,
                name: apiKey.name,
                key: key, // Only time the full key is returned!
                keyPrefix: apiKey.keyPrefix,
                status: apiKey.status,
                endpoints: apiKey.endpoints
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete API key
// @route   DELETE /api/admin/access-keys/:id
// @access  Private/Admin
const deleteApiKey = async (req, res, next) => {
    try {
        const apiKey = await ApiKey.findById(req.params.id);

        if (!apiKey) {
            return res.status(404).json({
                success: false,
                error: 'API key not found'
            });
        }

        await apiKey.deleteOne();

        res.json({
            success: true,
            message: 'API key deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (for assigning keys)
// @route   GET /api/admin/access-keys/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isActive: true })
            .select('name email role')
            .sort({ name: 1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getApiKeys,
    getApiKey,
    generateApiKey,
    updateApiKey,
    revokeApiKey,
    regenerateApiKey,
    deleteApiKey,
    getUsers
};
