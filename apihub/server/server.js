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

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
// app.use('/api/admin/audit', require('./routes/audit'));

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
