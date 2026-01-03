# APIHub - Project Documentation

## 📋 Project Overview

**APIHub** is a centralized API management platform that provides complete visibility and access control for API management. The platform allows users to build, secure, and monitor APIs from one central location.

**Current Status:** UI Development Phase (Frontend Only)

---

## 🛠 Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Frontend Framework | React | 19.2.0 |
| Build Tool | Vite | 7.2.4 |
| Styling | TailwindCSS | 4.1.18 |
| Routing | React Router DOM | 7.11.0 |
| Language | JavaScript (ES Modules) |

---

## 📁 Project Structure

```
apihub/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images and icons
│   ├── components/             # Reusable UI components
│   │   ├── APIManagement.jsx   # API endpoints table component
│   │   ├── Navbar.jsx          # Navigation bar component
│   │   ├── Overview.jsx        # Dashboard overview with stats and charts
│   │   └── ParticleSphere.jsx  # 3D particle animation for landing page
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication state management
│   ├── pages/
│   │   ├── AdminDashboard.jsx  # Admin panel with sidebar navigation
│   │   ├── Dashboard.jsx       # User welcome dashboard
│   │   ├── LandingPage.jsx     # Home/Marketing page
│   │   ├── LoginPage.jsx       # User login form
│   │   └── SignupPage.jsx      # User registration form
│   ├── styles/
│   │   └── index.css           # Global styles and TailwindCSS imports
│   ├── App.jsx                 # Main app with routing configuration
│   └── main.jsx                # React entry point
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite configuration
└── eslint.config.js            # ESLint configuration
```

---

## 🚀 Features

### 1. Landing Page (`/`)
- **Hero Section** with marketing content
- **3D Particle Sphere Animation** - Interactive visual element
- **Navigation Bar** with Login button
- **Call-to-Action** - Sign Up button

### 2. Authentication System

#### Login Page (`/login`)
- Email and password input fields
- Password visibility toggle
- "Remember me" checkbox
- Forgot password link
- Google Sign-in option
- Sign Up redirect link
- Error message display for invalid credentials

#### Signup Page (`/signup`)
- Full name input
- Email input
- Password input with visibility toggle
- Confirm password with visibility toggle
- Terms and Privacy Policy agreement checkbox
- Google Sign-up option
- Login redirect link

### 3. User Dashboard (`/dashboard`)
- Welcome message with user's name
- Success checkmark icon
- Clean, minimal design
- Logout functionality

### 4. Admin Dashboard (`/admin`)
- **Dark Sidebar Navigation** with 5 sections:
  - Overview (with stats and charts)
  - API Management (endpoints table)
  - Data Management (coming soon)
  - Access Keys (coming soon)
  - Audit Logs (coming soon)
- **Light Theme Main Content Area**
- **Search Bar** in header
- **Notification Bell**
- **User Profile Section** with avatar and logout

#### Overview Section
- **Stats Cards:**
  - Total Requests
  - Global Latency
  - Active Endpoints
  - Error Rate
- **Traffic Volume Chart** (Line chart with area fill)
- **Status Codes Donut Chart** (2xx, 4xx, 5xx series)

#### API Management Section
- **Search** for API endpoints
- **Filters** button
- **New Endpoint** button
- **Endpoints Table** with columns:
  - Name / Context
  - Route
  - Method (GET, POST, PUT, DELETE with color badges)
  - State (active/inactive)
  - Updated date
  - Actions menu
- Empty state when no endpoints

### 5. Role-Based Access Control
- **Public Routes:** Landing, Login, Signup
- **Protected Routes:** User Dashboard (requires login)
- **Admin Routes:** Admin Dashboard (requires admin role)
- Automatic redirect based on user role

---

## 📊 Data & Inputs

### Authentication Data (Demo Credentials - Hidden from UI)

| Role | Email | Password | Redirects To |
|------|-------|----------|--------------|
| User | `demo@apihub.com` | `demo123` | `/dashboard` |
| Admin | `admin@apihub.com` | `admin123` | `/admin` |

### User Object Structure

```javascript
{
    email: "string",      // User's email address
    name: "string",       // User's display name
    role: "string"        // Either "user" or "admin"
}
```

### Login Form Inputs

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Email | email | Yes | Valid email format |
| Password | password | Yes | Min 1 character |
| Remember Me | checkbox | No | - |

### Signup Form Inputs

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | text | Yes | Min 1 character |
| Email | email | Yes | Valid email format |
| Password | password | Yes | Min 1 character |
| Confirm Password | password | Yes | Must match password |
| Terms Agreement | checkbox | Yes | Must be checked |

---

## 📦 Sample Dataset

### Sample API Endpoint Object (for future backend integration)

```javascript
const apiEndpoint = {
    id: 1,
    name: "Products API",
    context: "ds_id: Product Inventory",
    route: "/api/v1/products",
    method: "GET",           // GET, POST, PUT, DELETE
    state: "active",         // active, inactive
    updated: "2024-12-27"
};
```

### Sample API Endpoints Array

```javascript
const apiEndpoints = [
    {
        id: 1,
        name: "Products API",
        context: "ds_id: Product Inventory",
        route: "/api/v1/products",
        method: "GET",
        state: "active",
        updated: "2024-12-27"
    },
    {
        id: 2,
        name: "Customers API",
        context: "ds_id: Customer List",
        route: "/api/v1/customers",
        method: "GET",
        state: "active",
        updated: "2024-12-26"
    },
    {
        id: 3,
        name: "Orders API",
        context: "ds_id: Order Management",
        route: "/api/v1/orders",
        method: "POST",
        state: "active",
        updated: "2024-12-25"
    },
    {
        id: 4,
        name: "Users API",
        context: "ds_id: User Authentication",
        route: "/api/v1/users",
        method: "PUT",
        state: "inactive",
        updated: "2024-12-20"
    },
    {
        id: 5,
        name: "Analytics API",
        context: "ds_id: Usage Analytics",
        route: "/api/v1/analytics",
        method: "DELETE",
        state: "active",
        updated: "2024-12-24"
    }
];
```

### Sample Traffic Data (for charts)

```javascript
const trafficData = [
    { time: '00:00', value: 200 },
    { time: '04:00', value: 400 },
    { time: '08:00', value: 1500 },
    { time: '12:00', value: 2700 },
    { time: '16:00', value: 2200 },
    { time: '20:00', value: 2800 },
    { time: '23:59', value: 3400 }
];
```

### Sample Overview Stats

```javascript
const overviewStats = {
    totalRequests: "2.4M",
    totalRequestsChange: "+12%",
    globalLatency: "45ms",
    latencyChange: "+5%",
    activeEndpoints: 2,
    endpointsStatus: "Operational",
    errorRate: "0.12%",
    errorRateChange: "+2%"
};
```

### Sample Status Codes Distribution

```javascript
const statusCodes = {
    "2xx": 85,    // Success responses (%)
    "4xx": 10,    // Client errors (%)
    "5xx": 5      // Server errors (%)
};
```

### Sample User Data

```javascript
const users = [
    {
        id: 1,
        email: "demo@apihub.com",
        password: "demo123",        // In production: hashed
        name: "Demo User",
        role: "user",
        createdAt: "2024-12-01"
    },
    {
        id: 2,
        email: "admin@apihub.com",
        password: "admin123",       // In production: hashed
        name: "Admin User",
        role: "admin",
        createdAt: "2024-12-01"
    },
    {
        id: 3,
        email: "john.doe@company.com",
        password: "john@123",       // In production: hashed
        name: "John Doe",
        role: "user",
        createdAt: "2024-12-15"
    }
];
```

---

## 🎨 UI/UX Design

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Background Dark | `#0a0e14` | Landing page, login pages |
| Background Medium | `#0d1220` | Gradient transition |
| Background Light | `#0a1628` | Gradient end |
| Primary Green | `#22c55e` | CTAs, success states |
| Primary Blue | `#3b82f6` | Admin theme, info states |
| Error Red | `#ef4444` | Error states |
| Warning Orange | `#f97316` | Warning states |
| Sidebar Dark | `#0f172a` | Admin sidebar |
| Card Background | `#111827` | Form cards |

### Typography
- **Primary Font:** System fonts (default)
- **Heading Sizes:** 4xl, 5xl, 6xl for hero; 2xl for form headings
- **Body Text:** sm, base, lg

### Design Patterns
- **Glassmorphism** - Backdrop blur on cards
- **Gradient Overlays** - Purple/green radial gradients
- **Micro-animations** - Hover effects, transitions
- **Dark Mode First** - Public pages use dark theme
- **Light Admin Panel** - Admin dashboard uses light theme for content

---

## 🔧 Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Flow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Landing Page (/)                                              │
│        │                                                        │
│        ├── Click "Login" ──────────► Login Page (/login)        │
│        │                                   │                    │
│        │                                   ├── Valid User ────► User Dashboard (/dashboard)
│        │                                   │                    │
│        │                                   └── Valid Admin ──► Admin Dashboard (/admin)
│        │                                                        │
│        └── Click "Sign Up" ────────► Signup Page (/signup)      │
│                                            │                    │
│                                            └── Success ───────► User Dashboard (/dashboard)
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Route Configuration

| Route | Page | Access Level | Description |
|-------|------|--------------|-------------|
| `/` | LandingPage | Public | Marketing/Home page |
| `/login` | LoginPage | Public (redirects if logged in) | User login |
| `/signup` | SignupPage | Public (redirects if logged in) | User registration |
| `/dashboard` | Dashboard | Protected (requires login) | User welcome page |
| `/admin` | AdminDashboard | Admin only | Admin control panel |

---

## 🔮 Backend Integration Guide

This section provides a complete guide to connect the frontend with a backend server.

---

## 🖥️ Recommended Backend Technology Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express.js | Web server framework |
| Database | MongoDB | NoSQL database for flexible data |
| ODM | Mongoose | MongoDB object modeling |
| Authentication | JWT (jsonwebtoken) | Token-based authentication |
| Password Hashing | bcryptjs | Secure password storage |
| Validation | express-validator | Input validation |
| Environment | dotenv | Environment variables |
| CORS | cors | Cross-origin requests |

---

## 📁 Backend Project Structure

```
apihub-backend/
├── config/
│   └── db.js                   # MongoDB connection
├── controllers/
│   ├── authController.js       # Authentication logic
│   ├── endpointController.js   # API endpoints CRUD
│   ├── analyticsController.js  # Stats and analytics
│   └── userController.js       # User management
├── middleware/
│   ├── auth.js                 # JWT authentication middleware
│   ├── admin.js                # Admin role check middleware
│   └── errorHandler.js         # Global error handler
├── models/
│   ├── User.js                 # User schema
│   ├── Endpoint.js             # API endpoint schema
│   └── Analytics.js            # Analytics data schema
├── routes/
│   ├── auth.js                 # Auth routes
│   ├── endpoints.js            # Endpoint routes
│   ├── analytics.js            # Analytics routes
│   └── users.js                # User routes
├── utils/
│   └── generateToken.js        # JWT token generator
├── .env                        # Environment variables
├── .env.example                # Example env file
├── package.json                # Dependencies
└── server.js                   # Entry point
```

---

## 📊 Database Schema (MongoDB)

### User Collection

```javascript
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false  // Don't return password by default
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### API Endpoint Collection

```javascript
// models/Endpoint.js
const mongoose = require('mongoose');

const endpointSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Endpoint name is required'],
        trim: true
    },
    context: {
        type: String,
        required: true
    },
    route: {
        type: String,
        required: [true, 'Route is required'],
        trim: true
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        required: true
    },
    state: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Endpoint', endpointSchema);
```

### Analytics Collection

```javascript
// models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    totalRequests: {
        type: Number,
        default: 0
    },
    statusCodes: {
        '2xx': { type: Number, default: 0 },
        '4xx': { type: Number, default: 0 },
        '5xx': { type: Number, default: 0 }
    },
    averageLatency: {
        type: Number,
        default: 0
    },
    trafficData: [{
        time: String,
        value: Number
    }]
});

module.exports = mongoose.model('Analytics', analyticsSchema);
```

---

## 🔌 Backend API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/auth/register` | Register new user | `{ name, email, password }` |
| POST | `/api/auth/login` | User login | `{ email, password }` |
| POST | `/api/auth/logout` | User logout | - |
| GET | `/api/auth/me` | Get current user | - (requires token) |
| POST | `/api/auth/google` | Google OAuth login | `{ googleToken }` |

### API Endpoints Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/endpoints` | Get all endpoints | Yes |
| GET | `/api/endpoints/:id` | Get single endpoint | Yes |
| POST | `/api/endpoints` | Create endpoint | Admin |
| PUT | `/api/endpoints/:id` | Update endpoint | Admin |
| DELETE | `/api/endpoints/:id` | Delete endpoint | Admin |

### Analytics Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/stats` | Get overview stats | Admin |
| GET | `/api/analytics/traffic` | Get traffic data | Admin |
| GET | `/api/analytics/errors` | Get error rates | Admin |

### User Management Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | Admin |
| GET | `/api/users/:id` | Get single user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

---

## 🔐 JWT Authentication Implementation

### Generate Token Utility

```javascript
// utils/generateToken.js
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

module.exports = generateToken;
```

### Auth Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                error: 'Not authorized to access this route' 
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            error: 'Not authorized' 
        });
    }
};

module.exports = protect;
```

### Admin Middleware

```javascript
// middleware/admin.js
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            error: 'Admin access required' 
        });
    }
};

module.exports = admin;
```

---

## 🔄 Frontend Integration Steps

### Step 1: Create API Service

Create a new file `src/services/api.js`:

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
    }
    
    return data;
};

// Auth API
export const authAPI = {
    login: (email, password) => 
        apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),
    
    register: (name, email, password) => 
        apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        }),
    
    getMe: () => apiCall('/auth/me'),
    
    logout: () => {
        localStorage.removeItem('token');
        return Promise.resolve();
    }
};

// Endpoints API
export const endpointsAPI = {
    getAll: () => apiCall('/endpoints'),
    getOne: (id) => apiCall(`/endpoints/${id}`),
    create: (data) => 
        apiCall('/endpoints', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    update: (id, data) => 
        apiCall(`/endpoints/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    delete: (id) => 
        apiCall(`/endpoints/${id}`, { method: 'DELETE' })
};

// Analytics API
export const analyticsAPI = {
    getStats: () => apiCall('/analytics/stats'),
    getTraffic: () => apiCall('/analytics/traffic'),
    getErrors: () => apiCall('/analytics/errors')
};
```

### Step 2: Update AuthContext

Replace the demo authentication in `src/context/AuthContext.jsx`:

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const data = await authAPI.getMe();
                    setUser(data.user);
                } catch (error) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true, role: data.user.role };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signup = async (fullName, email, password) => {
        try {
            const data = await authAPI.register(fullName, email, password);
            localStorage.setItem('token', data.token);
            setUser(data.user);
            return { success: true, role: data.user.role };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await authAPI.logout();
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';

    if (loading) {
        return <div>Loading...</div>; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
```

### Step 3: Update APIManagement Component

```javascript
// src/components/APIManagement.jsx
import { useState, useEffect } from 'react';
import { endpointsAPI } from '../services/api';

const APIManagement = () => {
    const [apiEndpoints, setApiEndpoints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEndpoints = async () => {
            try {
                const data = await endpointsAPI.getAll();
                setApiEndpoints(data.endpoints);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEndpoints();
    }, []);

    // ... rest of the component
};
```

### Step 4: Update Overview Component

```javascript
// src/components/Overview.jsx
import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [trafficData, setTrafficData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, traffic] = await Promise.all([
                    analyticsAPI.getStats(),
                    analyticsAPI.getTraffic()
                ]);
                setStats(statsData);
                setTrafficData(traffic.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ... rest of the component
};
```

### Step 5: Environment Configuration

Create `.env` file in frontend root:

```env
# Frontend .env
VITE_API_URL=http://localhost:5000/api
```

Create `.env` file in backend root:

```env
# Backend .env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/apihub
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Backend Setup Commands

```bash
# Create backend project
mkdir apihub-backend
cd apihub-backend
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken cors dotenv express-validator

# Install dev dependencies
npm install -D nodemon

# Create folder structure
mkdir config controllers middleware models routes utils

# Start development server
npm run dev
```

### Backend package.json scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

---

## 🔗 Server Entry Point

```javascript
// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/endpoints', require('./routes/endpoints'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));

// Error Handler
app.use(require('./middleware/errorHandler'));

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
```

---

## 📋 API Response Formats

### Success Response

```javascript
{
    "success": true,
    "data": { ... },
    "message": "Operation successful"
}
```

### Error Response

```javascript
{
    "success": false,
    "error": "Error message here"
}
```

### Login Response

```javascript
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": "507f1f77bcf86cd799439011",
        "name": "Demo User",
        "email": "demo@apihub.com",
        "role": "user"
    }
}
```

---

## ✅ Integration Checklist

- [ ] Set up MongoDB database
- [ ] Create backend project with Express
- [ ] Implement User model with password hashing
- [ ] Create JWT authentication
- [ ] Set up auth middleware
- [ ] Create all API routes
- [ ] Create `api.js` service in frontend
- [ ] Update AuthContext to use real API
- [ ] Update components to fetch from API
- [ ] Configure environment variables
- [ ] Test all endpoints with Postman
- [ ] Add error handling
- [ ] Deploy backend (Render, Railway, etc.)
- [ ] Deploy frontend (Vercel, Netlify, etc.)
- [ ] Update environment variables for production

---

## 📅 Last Updated

**Date:** December 27, 2024  
**Status:** UI Development Complete, Backend Integration Guide Added

---

## 👤 Developer Notes

- All demo data is hidden from UI but functional for testing
- Dashboard shows placeholder values (--) ready for real data
- API Management starts with empty state
- Authentication uses React Context (no external libraries)
- No external state management library used (Redux/Zustand)
- Backend integration requires MongoDB and Node.js installed locally

