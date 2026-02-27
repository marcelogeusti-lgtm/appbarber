const admin = require('firebase-admin');

/**
 * Initializes Firebase Admin SDK.
 * Expects FIREBASE_SERVICE_ACCOUNT_JSON as a stringified JSON in environment variables,
 * or fallbacks to individual components.
 */
function initializeFirebase() {
    try {
        if (admin.apps.length > 0) return admin.app();

        let serviceAccount;

        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        } else {
            // Try to load from file if ENV is missing or invalid
            try {
                const fs = require('fs');
                const path = require('path');
                const filePath = path.resolve(process.cwd(), 'firebase-service-account.json');

                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath, 'utf8');
                    serviceAccount = JSON.parse(fileContent);
                    console.log('[FirebaseAdmin] Configuration loaded from file.');
                }
            } catch (fErr) {
                console.warn('[FirebaseAdmin] Could not load from file:', fErr.message);
            }

            if (!serviceAccount) {
                // Manual fallback
                serviceAccount = {
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                };
            }
        }

        if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
            console.warn('[FirebaseAdmin] Missing configuration. Push notifications will not work.');
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
