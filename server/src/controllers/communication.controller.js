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

const prisma = require('../lib/prisma');

exports.getMessageLogs = async (req, res) => {
    try {
        let { barbershopId } = req.query;
        if (!barbershopId && req.user) barbershopId = req.user.barbershopId;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const logs = await prisma.messageLog.findMany({
            where: { barbershopId },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit to last 100 logs
        });

        res.json(logs);
    } catch (error) {
        console.error('Error fetching message logs:', error);
        res.status(500).json({ message: 'Error fetching message logs' });
    }
};
