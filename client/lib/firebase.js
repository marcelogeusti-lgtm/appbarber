import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInAnonymously } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase config keys
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
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
