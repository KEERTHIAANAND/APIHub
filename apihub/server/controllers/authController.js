const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const admin = require('../config/firebase');

// @desc    Register user with email/password
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, email and password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
            authProvider: 'local',
            role: 'user'
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        // Find user and include password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user registered with Google/Firebase
        if (user.authProvider !== 'local') {
            return res.status(400).json({
                success: false,
                error: `This account uses ${user.authProvider} sign-in. Please use that method.`
            });
        }

        // Compare password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate with Firebase token (Google Sign-In)
// @route   POST /api/auth/firebase
// @access  Public
const firebaseAuth = async (req, res, next) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: 'Firebase ID token is required'
            });
        }

        // Verify Firebase token
        let decodedToken;
        try {
            console.log('🔐 Verifying Firebase token...');
            decodedToken = await admin.auth().verifyIdToken(idToken);
            console.log('✅ Firebase token verified for:', decodedToken.email);
        } catch (firebaseError) {
            console.error('❌ Firebase token verification failed:', firebaseError.message);
            console.error('   Error code:', firebaseError.code);
            return res.status(401).json({
                success: false,
                error: 'Invalid Firebase token'
            });
        }

        const { uid, email, name, picture } = decodedToken;

        // Find or create user
        let user = await User.findOne({
            $or: [
                { firebaseUid: uid },
                { email: email.toLowerCase() }
            ]
        });

        if (user) {
            // Update existing user with Firebase info if needed
            if (!user.firebaseUid) {
                user.firebaseUid = uid;
                user.authProvider = 'google';
            }
            if (picture && !user.avatar) {
                user.avatar = picture;
            }
            user.lastLogin = new Date();
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                name: name || email.split('@')[0],
                email: email.toLowerCase(),
                firebaseUid: uid,
                authProvider: 'google',
                avatar: picture || null,
                role: 'user'
            });
        }

        // Generate our own JWT for subsequent requests
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                authProvider: user.authProvider,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user (just returns success - token handling on frontend)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    firebaseAuth,
    getMe,
    logout
};
