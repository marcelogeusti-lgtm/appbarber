const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsAppProvider = require('../services/communication/providers/WhatsAppProvider');

// Helper: Ensure conversation exists
const findOrCreateConversation = async (barbershopId, clientId, appointmentId = null) => {
    // Try to find open conversation first
    let conversation = await prisma.conversation.findFirst({
        where: {
            barbershopId,
            clientId,
            status: 'OPEN'
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                barbershopId,
                clientId,
                appointmentId, // Optional context
                status: 'OPEN'
            }
        });
    } else if (appointmentId && !conversation.appointmentId) {
        // Update context if better one provided
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { appointmentId }
        });
    }

    return conversation;
};

exports.createConversation = async (req, res) => {
    try {
        const { clientId, barbershopId, appointmentId } = req.body;
        if (!clientId || !barbershopId) return res.status(400).json({ message: 'Missing fields' });

        const conversation = await findOrCreateConversation(barbershopId, clientId, appointmentId);
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating conversation' });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const { barbershopId } = req.query; // If Barber viewing
        const userId = req.user.id; // If Client viewing

        const where = {};
        if (req.user.role === 'CLIENT') {
            where.clientId = userId;
        } else {
            // Barber/Admin
            if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required for staff' });
            where.barbershopId = barbershopId;
        }

        const conversas = await prisma.conversation.findMany({
            where,
            include: {
                client: { select: { id: true, name: true, phone: true, avatarUrl: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                },
                appointment: { select: { status: true, date: true, service: { select: { name: true } } } }
            },
            orderBy: { lastMessageAt: 'desc' }
        });

        res.json(conversas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { content, channel = 'APP' } = req.body;
        const senderId = req.user.id;

        // Resolve sender type
        // If sender is the Client linked to convo -> CLIENT
        // Else -> BARBER
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { client: true, barbershop: true }
        });

        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        const senderType = senderId === conversation.clientId ? 'CLIENT' : 'BARBER';

        // 1. Save Internal Message
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId,
                senderType,
                content,
                channel: 'APP', // Primary record
                status: 'SENT'
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() }
        });

        // 2. Hybrid Logic: Send to WhatsApp if requested OR if sender is Barber sending to Client
        if (senderType === 'BARBER' && channel === 'WHATSAPP') {
            // Check rules
            // Barbershop must have WA connected? (Assumed implicit or checked via Status)
            // Client must have phone
            if (conversation.client.phone) {
                const waStatus = await whatsAppProvider.getStatus();
                if (waStatus.status === 'CONNECTED') {
                    try {
                        const targetPhone = conversation.client.phone.replace(/\D/g, '');
                        // If logic requires '55', ensure it
                        const finalPhone = targetPhone.startsWith('55') ? targetPhone : `55${targetPhone}`;

                        await whatsAppProvider.sendText(finalPhone, content);

                        // Create a specific mirror message or update status?
                        // User request: "Mensagem enviada deve... Ter flag canal = whatsapp"
                        // Since we already saved as APP, maybe we update it or save a duplicate?
                        // "Mensagens internas (APP): Sempre salvas... Mensagens WhatsApp: Só disparadas se..."
                        // Let's mark the stored message as 'WHATSAPP' if successful? 
                        // Or better: Create a secondary record? 
                        // Simplest: Update the created message channel to 'WHATSAPP' if that was the intent.

                        await prisma.message.update({
                            where: { id: message.id },
                            data: { channel: 'WHATSAPP', status: 'DELIVERED' }
                        });

                    } catch (e) {
                        console.error('Failed to send WA:', e);
                        // Keep as APP, status FAILED?
                    }
                }
            }
        }

        // TODO: Push Notification to Receiver

        res.json(message);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// Internal Helper for Service Usage
exports.internalCreateMessage = async (conversationId, content, senderId, senderType, channel = 'APP') => {
    const message = await prisma.message.create({
        data: { conversationId, senderId, senderType, content, channel, status: 'SENT' }
    });
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
    });
    return message;
};

exports.findOrCreateConversation = findOrCreateConversation;
