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
    // Basic endpoint for testing
    // In production, move to service logic
    try {
        // const { phone, message } = req.body;
        // await communicationService...
        res.status(501).json({ message: 'Not implemented yet' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending message' });
    }
};
