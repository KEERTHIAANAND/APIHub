import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/AdminDashboard';
import { DashboardLayout, Overview, MyKeys, ApiDocs } from './components/developer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Admin Route Component - only accessible by admin users
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/overview" replace />;
  }
  return children;
};

// Public Route - redirects to appropriate dashboard if already logged in
const PublicRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (user) {
    return <Navigate to={isAdmin() ? "/admin" : "/overview"} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Developer Dashboard Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/overview" element={<Overview />} />
        <Route path="/my-keys" element={<MyKeys />} />
        <Route path="/api-docs" element={<ApiDocs />} />
      </Route>

      {/* Redirect /dashboard to /overview */}
      <Route path="/dashboard" element={<Navigate to="/overview" replace />} />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
