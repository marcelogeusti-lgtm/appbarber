import { useState, useEffect } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import api from '../lib/clientApi';
import { firebaseConfig } from '../lib/firebaseConfig';

export default function useFcm(user) {
    const [token, setToken] = useState(null);
    const [permission, setPermission] = useState(null);

    useEffect(() => {
        if (!user) return;

        const setupFcm = async () => {
            try {
                // 1. Request Permission
                const permissionStatus = await Notification.requestPermission();
                setPermission(permissionStatus);

                if (permissionStatus === 'granted') {
                    const app = initializeApp(firebaseConfig);
                    const messaging = getMessaging(app);

                    // 2. Get Token
                    const currentToken = await getToken(messaging, {
                        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY // User needs to provide this
                    });

                    if (currentToken) {
                        setToken(currentToken);
                        // 3. Save to Backend
                        await api.post('/notifications/fcm/fcm-token', {
                            token: currentToken,
                            deviceType: 'web'
                        });
                    }
                }
            } catch (error) {
                console.error('[useFcm] Error setup FCM:', error);
            }
        };

        setupFcm();

        // 4. Handle Foreground Messages
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);
            onMessage(messaging, (payload) => {
                console.log('[useFcm] Foreground message:', payload);
                // Optionally show a toast or alert
            });
        }
    }, [user]);

    return { token, permission };
}
