import { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

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
    const loginWithGoogle = async () => {
        try {
            setError(null);

            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            const idToken = await firebaseUser.getIdToken(true); 

            const tokenResult = await firebaseUser.getIdTokenResult();
            const firebaseClaims = tokenResult.claims;

            const response = await authAPI.firebaseAuth(idToken);

            if (response.success) {
                localStorage.setItem('token', response.token);

                const userWithRole = {
                    ...response.user,
                    firebaseRole: firebaseClaims.role || null
                };

                setUser(userWithRole);
                return { success: true, role: response.user.role };
            }

            return { success: false, error: response.error || 'Google login failed' };
        } catch (err) {
            console.error('Google login error:', err);
            setError(err.message);
            if (err.code === 'auth/popup-closed-by-user') {
                return { success: false, error: 'Login cancelled' };
            }
            if (err.code === 'auth/popup-blocked') {
                return { success: false, error: 'Please allow popups for this site' };
            }

            return { success: false, error: err.message || 'Google login failed' };
        }
    };

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

    const logout = async () => {
        try {
            if (auth.currentUser) {
                await signOut(auth);
            }
            localStorage.removeItem('token');
            setUser(null);
        } catch (err) {
            console.error('Logout error:', err);
            localStorage.removeItem('token');
            setUser(null);
        }
    };
    const isAdmin = () => {
        return user?.role === 'admin';
    };

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
