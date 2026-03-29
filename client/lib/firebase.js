import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInAnonymously } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase config keys with hardcoded fallbacks for stability
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC0tblT2UN55aJ2vEJSJ2ShbLBB7n4QQuY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "barberon-ac7f5.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "barberon-ac7f5",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "barberon-ac7f5.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "543382789695",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:543382789695:web:62548830d3c880c87d628a"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

/**
 * Ensures the user is authenticated with Firebase.
 * If not, attempts to sign in anonymously.
 */
export const ensureFirebaseAuth = async () => {
    if (auth.currentUser) return auth.currentUser;

    try {
        const result = await signInAnonymously(auth);
        return result.user;
    } catch (error) {
        console.error("Firebase Anonymous Auth Error:", error);
        throw error;
    }
};

// Safe check for development
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn("⚠️ Firebase configs are missing. Social login will not work.");
}

export { app };
