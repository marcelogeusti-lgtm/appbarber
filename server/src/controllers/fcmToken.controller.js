const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fcmTokenController = {
    /**
     * Store or update FCM token for the authenticated user
     */
    saveToken: async (req, res) => {
        try {
            const { token, deviceType } = req.body;
            const authUserId = req.user.id;

            if (!token) {
                return res.status(400).json({ error: 'Token is required' });
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
            const authUserId = req.user.id;

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
