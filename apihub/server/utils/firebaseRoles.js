const admin = require('../config/firebase');

/**
 * Set Firebase Custom Claims for a user
 * This should be called whenever a user's role is updated in MongoDB
 * 
 * @param {string} firebaseUid - The user's Firebase UID
 * @param {string} role - The role to set ('user' or 'admin')
 * @returns {Promise<boolean>} - Success status
 */
const setFirebaseRole = async (firebaseUid, role) => {
    if (!firebaseUid) {
        console.warn('No Firebase UID provided for setting custom claims');
        return false;
    }

    try {
        await admin.auth().setCustomUserClaims(firebaseUid, {
            role: role,
            isAdmin: role === 'admin',
            updatedAt: Date.now()
        });

        console.log(`✅ Firebase claims set for UID ${firebaseUid}: role=${role}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to set Firebase claims: ${error.message}`);
        return false;
    }
};

/**
 * Get Firebase Custom Claims for a user
 * 
 * @param {string} firebaseUid - The user's Firebase UID
 * @returns {Promise<object|null>} - The user's custom claims or null
 */
const getFirebaseRole = async (firebaseUid) => {
    if (!firebaseUid) {
        return null;
    }

    try {
        const userRecord = await admin.auth().getUser(firebaseUid);
        return userRecord.customClaims || {};
    } catch (error) {
        console.error(`❌ Failed to get Firebase claims: ${error.message}`);
        return null;
    }
};

/**
 * Revoke all refresh tokens for a user
 * Call this when role changes to force re-authentication
 * 
 * @param {string} firebaseUid - The user's Firebase UID
 */
const revokeFirebaseTokens = async (firebaseUid) => {
    if (!firebaseUid) {
        return false;
    }

    try {
        await admin.auth().revokeRefreshTokens(firebaseUid);
        console.log(`✅ Tokens revoked for UID ${firebaseUid}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to revoke tokens: ${error.message}`);
        return false;
    }
};

/**
 * Sync MongoDB role to Firebase Custom Claims
 * 
 * @param {object} user - MongoDB user document
 */
const syncRoleToFirebase = async (user) => {
    if (user.firebaseUid) {
        await setFirebaseRole(user.firebaseUid, user.role);
    }
};

module.exports = {
    setFirebaseRole,
    getFirebaseRole,
    revokeFirebaseTokens,
    syncRoleToFirebase
};
