const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.saveCard = async (req, res) => {
    try {
        const { gateway, token, last4, brand, expiryMonth, expiryYear } = req.body;
        const authUserId = req.user.id;

        const client = await prisma.client.findUnique({ where: { authUserId } });
        if (!client) return res.status(404).json({ message: 'Perfil de cliente não encontrado.' });

        const card = await prisma.cardToken.create({
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

        res.status(201).json(card);
    } catch (error) {
        console.error('Save Card Error:', error);
        res.status(500).json({ message: 'Erro ao salvar cartão.' });
    }
};

exports.getCards = async (req, res) => {
    try {
        const authUserId = req.user.id;
        const client = await prisma.client.findUnique({ where: { authUserId } });
        if (!client) return res.json([]);

        const cards = await prisma.cardToken.findMany({
            where: { clientId: client.id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(cards);
    } catch (error) {
        console.error('Get Cards Error:', error);
        res.status(500).json({ message: 'Erro ao buscar cartões.' });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.cardToken.delete({ where: { id } });
        res.json({ message: 'Cartão removido com sucesso.' });
    } catch (error) {
        console.error('Delete Card Error:', error);
        res.status(500).json({ message: 'Erro ao remover cartão.' });
    }
};
