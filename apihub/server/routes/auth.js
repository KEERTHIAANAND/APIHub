const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    firebaseAuth,
    getMe,
    logout
} = require('../controllers/authController');
const { makeFirstAdmin } = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/firebase', firebaseAuth);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/make-admin', protect, makeFirstAdmin);

module.exports = router;
