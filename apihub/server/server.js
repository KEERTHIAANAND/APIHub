const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
require('./config/firebase');

// Connect to database
connectDB();

const app = express();

// CORS configuration - allow multiple frontend ports
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'APIHub Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin/users', require('./routes/users'));
app.use('/api/admin/endpoints', require('./routes/endpoints'));
app.use('/api/admin/datasets', require('./routes/datasets'));
app.use('/api/admin/access-keys', require('./routes/apiKeys'));
app.use('/api/admin/dashboard-stats', require('./routes/dashboardStats'));
app.use('/api/admin/audit-logs', require('./routes/auditLogs'));

// Developer Routes (for non-admin users)
app.use('/api/developer', require('./routes/developer'));

// API Gateway - Dynamic endpoints (must be after admin routes)
app.use('/api/v1', require('./routes/gateway'));

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║   🚀 APIHub Server Running                    ║
    ║                                               ║
    ║   Port: ${PORT}                                 ║
    ║   Mode: ${process.env.NODE_ENV || 'development'}                       ║
    ║   URL:  http://localhost:${PORT}                ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
    `);
});

module.exports = app;
