import { useEffect, useState } from 'react';

export const usePushNotifications = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            registerServiceWorker();
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('SW Registered');

            const existingSub = await registration.pushManager.getSubscription();
            if (existingSub) {
                setSubscription(existingSub);
                setIsSubscribed(true);
            }
        } catch (error) {
            console.error('SW Registration failed:', error);
        }
    };

    const subscribeUser = async (vapidPublicKey) => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidPublicKey
            });

            setSubscription(sub);
            setIsSubscribed(true);
            return sub;
        } catch (error) {
            console.error('Failed to subscribe user:', error);
            return null;
        }
    };

    return { isSubscribed, subscription, subscribeUser };
};
