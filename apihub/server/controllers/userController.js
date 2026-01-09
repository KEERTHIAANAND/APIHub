const User = require('../models/User');
const admin = require('../config/firebase');

// @desc    Set user role (Admin only)
// @route   POST /api/admin/users/:userId/role
// @access  Private/Admin
const setUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        // Validate role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be "user" or "admin"'
            });
        }

        // Find user in MongoDB
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Update role in MongoDB
        user.role = role;
        await user.save();

        // If user has Firebase UID, also set custom claim
        if (user.firebaseUid) {
            try {
                await admin.auth().setCustomUserClaims(user.firebaseUid, {
                    role: role,
                    isAdmin: role === 'admin'
                });
                console.log(`✅ Firebase custom claims set for ${user.email}: role=${role}`);
            } catch (firebaseError) {
                console.error('Firebase custom claims error:', firebaseError.message);
                // Continue anyway - MongoDB role is still updated
            }
        }

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Don't allow deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete your own account'
            });
        }

        // Delete from Firebase if has UID
        if (user.firebaseUid) {
            try {
                await admin.auth().deleteUser(user.firebaseUid);
            } catch (firebaseError) {
                console.error('Firebase user deletion error:', firebaseError.message);
            }
        }

        await user.deleteOne();

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Make first user admin (one-time setup)
// @route   POST /api/auth/make-admin
// @access  Private (only works if no admins exist)
const makeFirstAdmin = async (req, res, next) => {
    try {
        // Check if any admin exists
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                error: 'Admin already exists. Contact existing admin for role changes.'
            });
        }

        // Make current user admin
        const user = await User.findById(req.user._id);
        user.role = 'admin';
        await user.save();

        // Set Firebase custom claims if applicable
        if (user.firebaseUid) {
            try {
                await admin.auth().setCustomUserClaims(user.firebaseUid, {
                    role: 'admin',
                    isAdmin: true
                });
            } catch (firebaseError) {
                console.error('Firebase custom claims error:', firebaseError.message);
            }
        }

        res.json({
            success: true,
            message: 'You are now an admin!',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    setUserRole,
    getAllUsers,
    getUserById,
    deleteUser,
    makeFirstAdmin
};
