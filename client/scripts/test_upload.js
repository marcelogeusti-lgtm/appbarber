import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const filename = `professionals/test_${Date.now()}.txt`;
const storageRef = ref(storage, filename);

async function run() {
    try {
        console.log("Uploading to:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        await uploadString(storageRef, "test data");
        console.log("Upload successful!");
        const url = await getDownloadURL(storageRef);
        console.log("URL:", url);
        process.exit(0);
    } catch (error) {
        console.error("Upload error details:", error);
        process.exit(1);
    }
}
run();
