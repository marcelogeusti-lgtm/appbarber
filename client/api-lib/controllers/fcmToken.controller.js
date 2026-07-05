const prisma = require('../lib/prisma');

const fcmTokenController = {
    /**
     * Store or update FCM token for the authenticated user
     */
    saveToken: async (req, res) => {
        try {
            const { token, deviceType } = req.body;
            // FcmToken.authUserId referencia AuthUser; no JWT isso é authUserId (não id, que é o Client/User)
            const authUserId = req.user.authUserId;

            if (!token) {
                return res.status(400).json({ error: 'Token is required' });
            }

            // Sem AuthUser no token não há como vincular o dispositivo — ignora silenciosamente
            if (!authUserId) {
                return res.json({ success: true, skipped: true });
            }

            // upsert token
            const fcmToken = await prisma.fcmToken.upsert({
                where: { token },
                update: {
                    authUserId,
                    deviceType,
                    lastUsedAt: new Date()
                },
                create: {
                    token,
                    authUserId,
                    deviceType
                }
            });

            res.json({ success: true, data: fcmToken });
        } catch (error) {
            console.error('[FcmTokenController] Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Remote a specific token
     */
    deleteToken: async (req, res) => {
        try {
            const { token } = req.params;
            const authUserId = req.user.authUserId;

            await prisma.fcmToken.deleteMany({
                where: {
                    token,
                    authUserId
                }
            });

            res.json({ success: true });
        } catch (error) {
            console.error('[FcmTokenController] Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = fcmTokenController;
