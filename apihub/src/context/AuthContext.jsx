import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on app load
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authAPI.getMe();
                    if (response.success) {
                        setUser(response.user);
                    }
                } catch (err) {
                    // Token invalid or expired
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Manual login with email/password
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authAPI.login({ email, password });

            if (response.success) {
                localStorage.setItem('token', response.token);
                setUser(response.user);
                return { success: true, role: response.user.role };
            }
            return { success: false, error: response.error || 'Login failed' };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Login with Google via Firebase
    const loginWithGoogle = async () => {
        try {
            setError(null);

            // Sign in with Firebase Google popup
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            // Get Firebase ID token with custom claims
            const idToken = await firebaseUser.getIdToken(true); // force refresh to get latest claims

            // Read custom claims from the token (optional - for frontend role checking)
            const tokenResult = await firebaseUser.getIdTokenResult();
            const firebaseClaims = tokenResult.claims;
            console.log('Firebase custom claims:', firebaseClaims);

            // Send token to our backend for verification and user creation/login
            const response = await authAPI.firebaseAuth(idToken);

            if (response.success) {
                localStorage.setItem('token', response.token);

                // Use role from backend response (MongoDB) as primary source
                // Firebase claims are synced with MongoDB role
                const userWithRole = {
                    ...response.user,
                    // If Firebase has a role claim, it should match MongoDB
                    firebaseRole: firebaseClaims.role || null
                };

                setUser(userWithRole);
                return { success: true, role: response.user.role };
            }

            return { success: false, error: response.error || 'Google login failed' };
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.message);

            // Handle specific Firebase errors
            if (err.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Login cancelled' };
            }
            if (err.code === 'auth/popup-blocked') {
                return { success: false, error: 'Please allow popups for this site' };
            }

            return { success: false, error: err.message || 'Google login failed' };
        }
    };

    // Sign up with email/password
    const signup = async (fullName, email, password) => {
        try {
            setError(null);
            const response = await authAPI.register({
                name: fullName,
                email,
                password
            });

            if (response.success) {
                localStorage.setItem('token', response.token);
                setUser(response.user);
                return { success: true, role: response.user.role };
            }
            return { success: false, error: response.error || 'Signup failed' };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            // Sign out from Firebase if signed in via Google
            if (auth.currentUser) {
                await signOut(auth);
            }

            // Clear local storage
            localStorage.removeItem('token');
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
            // Still clear local state even if Firebase signout fails
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    // Check if user is admin
    const isAdmin = () => {
        return user?.role === 'admin';
    };

    // Loading state while checking auth
    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithGoogle,
            signup,
            logout,
            isAdmin,
            error,
            setError
        }}>
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
