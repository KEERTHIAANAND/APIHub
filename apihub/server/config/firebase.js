const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// You'll need to download your Firebase service account key from:
// Firebase Console > Project Settings > Service Accounts > Generate New Private Key
// Save it as 'firebase-service-account.json' in the config folder

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin SDK initialized');
    console.log(`   Project: ${serviceAccount.project_id}`);
} catch (error) {
    console.error('❌ Firebase Admin SDK Error:', error.message);
    console.warn('⚠️  Firebase Admin SDK not initialized');
    console.warn('   Please add firebase-service-account.json to server/config/');
    console.warn('   Google Sign-In verification will not work until this is configured.');

    // Initialize without credentials for development
    // This allows the app to run but Firebase auth won't work
    if (!admin.apps.length) {
        admin.initializeApp();
    }
}

module.exports = admin;
