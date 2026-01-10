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

exports.sendManualMessage = async (req, res) => {
    try {
        const { clientId, content } = req.body;
        // Logic to send manually
        // await communicationService.sendManual(clientId, content);
        res.status(501).json({ message: 'Not implemented' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
};

exports.getConversations = async (req, res) => {
    try {
        // Group logs by client
        // Since Prisma doesn't support easy 'distinct on' with sorting in one go perfectly for chat list,
        // we might fetch recent logs and aggregate or use raw query.
        // Simplify: Fetch clients who have communication logs.
        // Better: Fetch unique clientIds from CommunicationLog
        /*
        const logs = await prisma.communicationLog.findMany({
           orderBy: { createdAt: 'desc' },
           distinct: ['clientId'],
           include: { client: true }
        });
        */
        // Actually let's delegate to service or direct prisma here
        // Start simple
        res.json([]);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { clientId } = req.params;
        // Fetch logs for client
        /*
        const messages = await prisma.communicationLog.findMany({
            where: { clientId },
            orderBy: { createdAt: 'asc' }
        });
        */
        res.json([]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
}
