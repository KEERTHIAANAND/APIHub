const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getApiKeys,
    getApiKey,
    generateApiKey,
    updateApiKey,
    revokeApiKey,
    regenerateApiKey,
    deleteApiKey,
    getUsers
} = require('../controllers/apiKeyController');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// API Key routes
router.get('/', getApiKeys);
router.get('/users', getUsers); // Get users for assigning keys
router.get('/:id', getApiKey);
router.post('/generate', generateApiKey);
router.put('/:id', updateApiKey);
router.patch('/:id/revoke', revokeApiKey);
router.patch('/:id/regenerate', regenerateApiKey);
router.delete('/:id', deleteApiKey);

module.exports = router;
