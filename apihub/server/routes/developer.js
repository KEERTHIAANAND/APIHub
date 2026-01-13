const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getMyApiKeys,
    getMyStats,
    getMyRequestHistory,
    getMyEndpoints
} = require('../controllers/developerController');

// All routes require authentication
router.use(protect);

// Get my API keys
router.get('/api-keys', getMyApiKeys);

// Get my usage stats
router.get('/stats', getMyStats);

// Get my request history
router.get('/history', getMyRequestHistory);

// Get available endpoints for my keys
router.get('/endpoints', getMyEndpoints);

module.exports = router;
