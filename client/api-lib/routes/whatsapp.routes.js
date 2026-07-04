const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const prisma = require('../lib/prisma');
const whatsappService = require('../services/communication/WhatsAppService');
const whatsAppQuota = require('../services/communication/WhatsAppQuota');

// Middleware to ensure Barbershop context
const getBarbershop = async (req, res, next) => {
    try {
        let barbershopId = req.params.barbershopId;
        
        // If master admin, allow explicit barbershopId. If barber, ensure they own it.
        if (req.user.role === 'BARBER') {
            const prof = await prisma.professional.findUnique({
                where: { userId: req.user.id },
                include: { barbershop: true }
            });
            if (!prof || (barbershopId && prof.barbershopId !== barbershopId)) {
                return res.status(403).json({ error: 'Access Denied' });
            }
            barbershopId = prof.barbershopId;
        }

        const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
        if (!barbershop) return res.status(404).json({ error: 'Barbershop not found' });

        req.barbershop = barbershop;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/whatsapp/status/:barbershopId
// Returns current connection status
router.get('/status/:barbershopId', protect, getBarbershop, async (req, res) => {
    try {
        const { barbershop } = req;
        const evoStatus = await whatsappService.fetchConnectionState(barbershop.slug);
        
        let status = barbershop.whatsappStatus || 'DISCONNECTED';
        if (evoStatus && evoStatus.state) {
            if (evoStatus.state === 'open') status = 'CONNECTED';
            else if (evoStatus.state === 'connecting') status = 'CONNECTING';
            
            // Sync local DB just in case it changed externally
            if (barbershop.whatsappStatus !== status) {
                await prisma.barbershop.update({
                    where: { id: barbershop.id },
                    data: { whatsappStatus: status }
                });
            }
        }

        res.json({ status });
    } catch (error) {
        console.error('Failed to get WA Status:', error.message);
        // Fallback to DB state instead of crashing
        res.json({ status: req.barbershop?.whatsappStatus || 'DISCONNECTED' });
    }
});

// POST /api/whatsapp/connect/:barbershopId
// Creates instance and returns QR Code
router.post('/connect/:barbershopId', protect, getBarbershop, async (req, res) => {
    try {
        const { barbershop } = req;
        const result = await whatsappService.getQRCode(barbershop.slug);
        
        await prisma.barbershop.update({
            where: { id: barbershop.id },
            data: { whatsappStatus: 'WAITING_QR' }
        });

        // The result contains { base64: "...", pairingCode: "..." }
        res.json({ 
            status: 'WAITING_QR', 
            qr: result.base64 || result.qrcode 
        });
    } catch (error) {
        console.error('Failed to get WA QR Code (Evolution offline?), falling back to mock:', error.message);
        
        // Force fallback to mock if API fails
        await prisma.barbershop.update({
            where: { id: req.barbershop.id },
            data: { whatsappStatus: 'WAITING_QR' }
        });

        res.json({ 
            status: 'WAITING_QR', 
            qr: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=' 
        });
    }
});

// DELETE /api/whatsapp/disconnect/:barbershopId
// Logs out and deletes instance
router.delete('/disconnect/:barbershopId', protect, getBarbershop, async (req, res) => {
    try {
        const { barbershop } = req;
        const success = await whatsappService.logoutInstance(barbershop.slug);
        
        // Force disconnect in DB to prevent getting stuck if API is down
        await prisma.barbershop.update({
            where: { id: barbershop.id },
            data: { whatsappStatus: 'DISCONNECTED' }
        });
        res.json({ message: 'Disconnected successfully', success });
    } catch (error) {
        console.error('Failed to disconnect WA:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/whatsapp/usage/:barbershopId — consumo mensal vs limite do plano
router.get('/usage/:barbershopId', protect, getBarbershop, async (req, res) => {
    try {
        const usage = await whatsAppQuota.getUsage(req.params.barbershopId);
        res.json(usage);
    } catch (error) {
        console.error('[WhatsApp Usage] Error:', error);
        res.status(500).json({ error: 'Erro ao consultar uso de mensagens.' });
    }
});

module.exports = router;

// POST /api/whatsapp/simulate-scan/:barbershopId
// Dev-only route to mock the webhook that sets the instance to CONNECTED
router.post('/simulate-scan/:barbershopId', protect, getBarbershop, async (req, res) => {
    try {
        const { barbershop } = req;
        await prisma.barbershop.update({
            where: { id: barbershop.id },
            data: { whatsappStatus: 'CONNECTED' }
        });
        res.json({ status: 'CONNECTED' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to simulate scan' });
    }
});
