import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Demo credentials
    const DEMO_USERS = [
        { email: 'demo@apihub.com', password: 'demo123', name: 'Demo User' },
        { email: 'admin@apihub.com', password: 'admin123', name: 'Admin User' }
    ];

    const login = (email, password) => {
        const foundUser = DEMO_USERS.find(
            (u) => u.email === email && u.password === password
        );

        if (foundUser) {
            setUser({ email: foundUser.email, name: foundUser.name });
            return { success: true };
        }
        return { success: false, error: 'Invalid email or password' };
    };

    const loginWithGoogle = () => {
        // Simulate Google login with a demo user
        setUser({ email: 'google.user@gmail.com', name: 'Google User' });
        return { success: true };
    };

    const signup = (fullName, email) => {
        // Simulate signup - in real app, this would create account
        setUser({ email, name: fullName });
        return { success: true };
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, loginWithGoogle, signup, logout }}>
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
