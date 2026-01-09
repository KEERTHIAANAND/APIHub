const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
    setUserRole,
    getAllUsers,
    getUserById,
    deleteUser
} = require('../controllers/userController');

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// User management routes
router.get('/', getAllUsers);
router.get('/:userId', getUserById);
router.post('/:userId/role', setUserRole);
router.delete('/:userId', deleteUser);

module.exports = router;
