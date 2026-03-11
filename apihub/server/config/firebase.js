const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// You'll need to download your Firebase service account key from:
// Firebase Console > Project Settings > Service Accounts > Generate New Private Key
// Save it as 'firebase-service-account.json' in the config folder

let serviceAccount;

// Try to load from environment variable first (for production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Firebase credentials loaded from environment variable');
    } catch (e) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', e.message);
    }
}

// Fall back to file (for local development)
if (!serviceAccount) {
    try {
        const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
        serviceAccount = require(serviceAccountPath);
        console.log('✅ Firebase credentials loaded from file');
    } catch (e) {
        console.warn('⚠️  No Firebase credentials found');
    }
}

// Initialize Firebase Admin
try {
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized');
        console.log(`   Project: ${serviceAccount.project_id}`);
    } else {
        console.error('❌ Firebase Admin SDK not initialized - no credentials');
        console.warn('   Set FIREBASE_SERVICE_ACCOUNT env var or add firebase-service-account.json');
        if (!admin.apps.length) {
            admin.initializeApp();
        }
    }
} catch (error) {
    console.error('❌ Firebase Admin SDK Error:', error.message);
    if (!admin.apps.length) {
        admin.initializeApp();
    }
}

module.exports = admin;
