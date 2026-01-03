import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Demo credentials for UI testing (not shown in login form)
    const DEMO_USERS = [
        { email: 'demo@apihub.com', password: 'demo123', name: 'Demo User', role: 'user' },
        { email: 'admin@apihub.com', password: 'admin123', name: 'Admin User', role: 'admin' }
    ];

    const login = (email, password) => {
        const foundUser = DEMO_USERS.find(
            (u) => u.email === email && u.password === password
        );

        if (foundUser) {
            setUser({
                email: foundUser.email,
                name: foundUser.name,
                role: foundUser.role
            });
            return { success: true, role: foundUser.role };
        }
        return { success: false, error: 'Invalid email or password' };
    };

    const loginWithGoogle = () => {
        // Simulate Google login with a demo user
        setUser({ email: 'google.user@gmail.com', name: 'Google User', role: 'user' });
        return { success: true, role: 'user' };
    };

    const signup = (fullName, email, password) => {
        // Simulate signup for UI testing
        setUser({ email, name: fullName, role: 'user' });
        return { success: true, role: 'user' };
    };

    const logout = () => {
        setUser(null);
    };

    const isAdmin = () => {
        return user?.role === 'admin';
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout, isAdmin }}>
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
