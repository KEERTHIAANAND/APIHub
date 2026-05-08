const mongoose = require('mongoose');

const DEFAULT_LOCAL_URI = 'mongodb://127.0.0.1:27017/apihub';

const sanitizeMongoUri = (uri = '') => uri.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/i, '$1<credentials>@');

const isSrvDnsError = (error) => {
    const message = error?.message || '';
    return message.includes('querySrv ECONNREFUSED') || message.includes('querySrv ENOTFOUND') || message.includes('querySrv ETIMEOUT');
};

const getMongoCandidateUris = () => {
    const uris = [
        process.env.MONGODB_URI,
        process.env.MONGODB_URI_FALLBACK,
        process.env.NODE_ENV === 'development' ? DEFAULT_LOCAL_URI : null
    ].filter(Boolean);

    return [...new Set(uris)];
};

const connectDB = async () => {
    const candidateUris = getMongoCandidateUris();

    if (candidateUris.length === 0) {
        console.error('❌ MongoDB Connection Error: MONGODB_URI is not configured.');
        process.exit(1);
    }

    let lastError = null;

    for (let i = 0; i < candidateUris.length; i += 1) {
        const uri = candidateUris[i];
        const isPrimarySrvUri = i === 0 && uri.startsWith('mongodb+srv://');

        try {
            if (i > 0) {
                console.warn(`⚠️ Retrying MongoDB connection with fallback URI: ${sanitizeMongoUri(uri)}`);
            }

            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 10000
            });

            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            return;
        } catch (error) {
            lastError = error;

            if (isPrimarySrvUri && isSrvDnsError(error)) {
                console.warn('⚠️ SRV DNS lookup failed for Atlas URI. Trying fallback MongoDB URI(s)...');
                continue;
            }

            if (i < candidateUris.length - 1) {
                console.warn(`⚠️ MongoDB connection failed for ${sanitizeMongoUri(uri)}. Trying next fallback...`);
            }
        }
    }

    console.error(`❌ MongoDB Connection Error: ${lastError?.message || 'Unknown error'}`);
    process.exit(1);
};

module.exports = connectDB;
