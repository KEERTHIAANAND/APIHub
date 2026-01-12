const jwt = require('jsonwebtoken');
const admin = require('../config/firebase');
const User = require('../models/User');
const config = require('../config/config');

// Protect routes - verify JWT or Firebase token
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }

    try {
        // First, try to verify as a Firebase token
        try {
            const decodedFirebase = await admin.auth().verifyIdToken(token);
            console.log('✅ Firebase token verified in middleware');

            // Find user by Firebase UID
            let user = await User.findOne({ firebaseUid: decodedFirebase.uid });

            if (!user) {
                // Auto-create user from Firebase data (for Google Sign-In)
                user = await User.create({
                    name: decodedFirebase.name || decodedFirebase.email.split('@')[0],
                    email: decodedFirebase.email,
                    firebaseUid: decodedFirebase.uid,
                    authProvider: decodedFirebase.firebase?.sign_in_provider === 'google.com' ? 'google' : 'firebase',
                    avatar: decodedFirebase.picture || null,
                    role: 'user'
                });
            }

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            req.user = user;
            req.authType = 'firebase';
            console.log(`   User: ${user.email}, Role: ${user.role}`);
            return next();
        } catch (firebaseError) {
            // Not a valid Firebase token, try JWT
            console.log('⚠️ Not a Firebase token, trying JWT...');
        }

        // Try to verify as a local JWT token
        const decoded = jwt.verify(token, config.jwtSecret);
        console.log('✅ JWT token verified');

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User account is deactivated'
            });
        }

        req.user = user;
        req.authType = 'jwt';
        console.log(`   User: ${user.email}, Role: ${user.role}`);
        next();
    } catch (error) {
        console.error('❌ Auth Error:', error.message);
        return res.status(401).json({
            success: false,
            error: 'Not authorized to access this route'
        });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            error: 'Access denied. Admin privileges required.'
        });
    }
};

// Generate JWT token for local auth
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, config.jwtSecret, {
        expiresIn: config.jwtExpire
    });
};

module.exports = { protect, adminOnly, generateToken };
