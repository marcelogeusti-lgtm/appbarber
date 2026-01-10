const communicationService = require('../services/communication/CommunicationService');

exports.getStatus = async (req, res) => {
    try {
        const status = await communicationService.getConnectionStatus();
        res.json(status);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error checking WhatsApp status' });
    }
};

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ... existing code

exports.sendManualMessage = async (req, res) => {
    try {
        const { clientId, content } = req.body;

        const client = await prisma.user.findUnique({ where: { id: clientId } });
        if (!client || !client.phone) {
            return res.status(404).json({ message: 'Client phone not found' });
        }

        // Send via WhatsApp Provider
        await communicationService.currentProvider.sendText(client.phone, content);

        // Log
        const log = await prisma.communicationLog.create({
            data: {
                barbershopId: req.user.barbershopId,
                clientId: clientId,
                type: 'WHATSAPP',
                direction: 'OUTBOUND',
                content: content,
                status: 'SENT',
                metadata: { manual: true, senderId: req.user.id }
            }
        });

        res.json(log);
    } catch (error) {
        console.error('Send manual message error:', error);
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId;

        // Find clients interacting with this barbershop (optimization needed for scale, but fine for now)
        // We select users who have at least one communication log with this barbershop
        const clients = await prisma.user.findMany({
            where: {
                communicationLogs: {
                    some: { barbershopId }
                }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                avatarUrl: true,
                communicationLogs: {
                    where: { barbershopId },
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        content: true,
                        createdAt: true,
                        direction: true,
                        status: true
                    }
                }
            }
        });

        // Format for frontend
        const conversations = clients.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone || 'Sem número',
            avatar: c.avatarUrl,
            lastMessage: c.communicationLogs[0]?.content || '',
            lastMessageDate: c.communicationLogs[0]?.createdAt,
            unread: 0 // Placeholder
        })).sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));

        res.json(conversations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { clientId } = req.params;
        const barbershopId = req.user.barbershopId;

        const messages = await prisma.communicationLog.findMany({
            where: { clientId, barbershopId },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
}
