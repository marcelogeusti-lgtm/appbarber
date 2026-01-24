const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class CardVault {
    /**
     * Saves a tokenized card to the vault.
     * Expects tokenization happened in the frontend.
     */
    async saveCard(userId, cardData) {
        const { token, last4, brand, gateway, expiryMonth, expiryYear } = cardData;

        // Find or create client for this user
        let client = await prisma.client.findUnique({ where: { authUserId: userId } });
        if (!client) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            client = await prisma.client.create({
                data: {
                    authUserId: userId,
                    name: user.name,
                    phone: user.phone
                }
            });
        }

        return await prisma.cardToken.create({
            data: {
                clientId: client.id,
                gateway,
                token,
                last4,
                brand,
                expiryMonth,
                expiryYear
            }
        });
    }

    async getCards(userId) {
        const client = await prisma.client.findUnique({ where: { authUserId: userId } });
        if (!client) return [];

        return await prisma.cardToken.findMany({
            where: { clientId: client.id },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteCard(cardId, userId) {
        // Verify ownership
        const card = await prisma.cardToken.findUnique({
            where: { id: cardId },
            include: { client: true }
        });

        if (!card || card.client.authUserId !== userId) {
            throw new Error('Card not found or access denied.');
        }

        return await prisma.cardToken.delete({ where: { id: cardId } });
    }
}

module.exports = new CardVault();
