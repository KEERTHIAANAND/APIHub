import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
// Get these values from: Firebase Console > Project Settings > General > Your apps > Web app
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC2nm7N8Ug8HkOw4tAQtewX060LSQ-ZfRE",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apihub-4cfbf.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apihub-4cfbf",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apihub-4cfbf.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "721174229044",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:721174229044:web:51e19d0603fdb2f4881a61",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-0CPS381JYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

export default app;
