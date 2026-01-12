const express = require('express');
const router = express.Router();
const { validateApiKey } = require('../middleware/apiKeyAuth');
const {
    handleApiRequest,
    getAvailableEndpoints
} = require('../controllers/gatewayController');

// All routes require valid API key
router.use(validateApiKey);

// Special endpoint: List available endpoints for this API key
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to APIHub Gateway',
        documentation: `${req.protocol}://${req.get('host')}/api/v1/endpoints`,
        version: 'v1'
    });
});

// Get available endpoints documentation
router.get('/endpoints', getAvailableEndpoints);

// Catch all other routes - dynamic routing
router.all('/*', handleApiRequest);

module.exports = router;
