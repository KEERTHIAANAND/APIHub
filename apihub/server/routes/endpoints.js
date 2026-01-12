const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    getEndpoints,
    getEndpoint,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    toggleEndpoint,
    testEndpoint
} = require('../controllers/endpointController');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Endpoint routes
router.get('/', getEndpoints);
router.get('/:id', getEndpoint);
router.get('/:id/test', testEndpoint);
router.post('/', createEndpoint);
router.put('/:id', updateEndpoint);
router.patch('/:id/toggle', toggleEndpoint);
router.delete('/:id', deleteEndpoint);

module.exports = router;
