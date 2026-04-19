const admin = require('firebase-admin');

/**
 * Initializes Firebase Admin SDK.
 * Expects FIREBASE_SERVICE_ACCOUNT_JSON as a stringified JSON in environment variables,
 * or fallbacks to individual components.
 */
function initializeFirebase() {
    try {
        if (admin.apps.length > 0) return admin.app();

        if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
            console.warn('[FirebaseAdmin] Missing FIREBASE_SERVICE_ACCOUNT environment variable. Push notifications will not work.');
            return null;
        }

        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
            console.warn('[FirebaseAdmin] Invalid FIREBASE_SERVICE_ACCOUNT format. Push notifications will not work.');
            return null;
        }

        return admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error('[FirebaseAdmin] Initialization Error:', error.message);
        return null;
    }
}

const firebaseApp = initializeFirebase();

module.exports = {
    admin,
    firebaseApp,
    messaging: firebaseApp ? admin.messaging() : null
};
