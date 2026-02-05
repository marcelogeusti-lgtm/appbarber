const webpush = require('web-push');

/**
 * PushNotificationService
 * Handles sending browser/mobile push notifications using Web Push protocol.
 */
class PushNotificationService {
    constructor() {
        this.vapidKeys = {
            publicKey: process.env.VAPID_PUBLIC_KEY,
            privateKey: process.env.VAPID_PRIVATE_KEY
        };

        if (this.vapidKeys.publicKey && this.vapidKeys.privateKey) {
            webpush.setVapidDetails(
                `mailto:${process.env.EMAIL_USER || 'admin@example.com'}`,
                this.vapidKeys.publicKey,
                this.vapidKeys.privateKey
            );
        }
    }

    /**
     * Sends a push notification to a specific subscription.
     */
    async sendNotification(subscription, payload) {
        if (!this.vapidKeys.publicKey) {
            console.warn('[PushService] VAPID keys not configured. Skipping.');
            return;
        }

        try {
            await webpush.sendNotification(
                subscription,
                JSON.stringify(payload)
            );
            return { success: true };
        } catch (error) {
            console.error('[PushService] Send Error:', error.message);
            if (error.statusCode === 410 || error.statusCode === 404) {
                // Subscription has expired or is no longer valid
                return { success: false, expired: true };
            }
            return { success: false };
        }
    }

    /**
     * Broadcasts notification to multiple users.
     */
    async broadcast(subscriptions, payload) {
        const results = await Promise.all(
            subscriptions.map(sub => this.sendNotification(sub, payload))
        );
        return results;
    }
}

module.exports = new PushNotificationService();
