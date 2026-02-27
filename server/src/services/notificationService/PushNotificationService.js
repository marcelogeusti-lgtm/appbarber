const { messaging } = require('../../config/firebaseAdmin');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * PushNotificationService
 * Handles sending browser/mobile push notifications using Firebase Cloud Messaging (FCM).
 */
class PushNotificationService {
    /**
     * Sends a push notification to a specific FCM token.
     */
    async sendByToken(token, title, body, data = {}) {
        if (!messaging) {
            console.warn('[PushService] Firebase Messaging not initialized. Skipping.');
            return { success: false };
        }

        const message = {
            notification: {
                title: title,
                body: body,
                icon: '/icons/icon-192.png'
            },
            data: {
                ...data,
                click_action: data.url || '/'
            },
            token: token
        };

        try {
            const response = await messaging.send(message);
            return { success: true, messageId: response };
        } catch (error) {
            console.error('[PushService] FCM Send Error:', error.message);
            if (error.code === 'messaging/registration-token-not-registered' ||
                error.code === 'messaging/invalid-registration-token') {
                // Token is no longer valid, we should remove it
                await prisma.fcmToken.deleteMany({ where: { token } });
                return { success: false, expired: true };
            }
            return { success: false, error: error.message };
        }
    }

    /**
     * Sends push notifications to all devices of a specific user.
     */
    async sendToUser(authUserId, title, body, data = {}) {
        try {
            const tokens = await prisma.fcmToken.findMany({
                where: { authUserId },
                select: { token: true }
            });

            if (tokens.length === 0) return [];

            const promises = tokens.map(t => this.sendByToken(t.token, title, body, data));
            return await Promise.all(promises);
        } catch (error) {
            console.error('[PushService] sendToUser Error:', error);
            return [];
        }
    }

    /**
     * Broadcasts notification to multiple tokens.
     */
    async broadcast(tokens, title, body, data = {}) {
        const promises = tokens.map(token => this.sendByToken(token, title, body, data));
        return await Promise.all(promises);
    }
}

module.exports = new PushNotificationService();
