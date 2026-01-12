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

// Methods for chat/CRM removed. only getStatus remains.

