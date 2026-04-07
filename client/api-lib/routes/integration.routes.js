const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/communication/GoogleCalendarService');
const whatsAppProvider = require('../services/communication/providers/WhatsAppProvider');
const { protect } = require('../middlewares/auth.middleware');

// Google Calendar Auth URL
router.get('/google/auth-url', protect, async (req, res) => {
    try {
        const prisma = require('../lib/prisma');

        // Find professional profile linked to current user
        const professional = await prisma.professional.findUnique({
            where: { userId: req.user.id }
        });

        if (!professional) {
            return res.status(404).json({ message: 'Perfil profissional não encontrado.' });
        }

        const url = googleCalendarService.generateAuthUrl(professional.id);
        res.json({ url });
    } catch (error) {
        console.error('Error generating auth url:', error);
        res.status(500).json({ message: 'Erro ao gerar link de autenticação' });
    }
});

// Google Calendar OAuth Callback
router.get('/google/callback', async (req, res) => {
    const { code, state } = req.query; // state is professionalId
    try {
        const tokens = await googleCalendarService.handleCallback(code, state);

        // Return a simple success page that closes itself or redirects back to dashboard
        res.send('<html><body><h1>Conectado com sucesso!</h1><p>Você já pode fechar esta janela.</p><script>window.close();</script></body></html>');
    } catch (error) {
        console.error('[GoogleCallback] Error:', error.message);
        res.status(500).send('Erro ao conectar com Google Calendar');
    }
});

// WhatsApp Status & QR (For Dashboard UI)
router.get('/whatsapp/status', protect, async (req, res) => {
    try {
        const status = await whatsAppProvider.getStatus();
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar status do WhatsApp' });
    }
});

// Push Subscription (Register Device)
router.post('/push/subscribe', protect, async (req, res) => {
    try {
        const { subscription } = req.body;
        const prisma = require('../lib/prisma');

        await prisma.pushSubscription.upsert({
            where: { endpoint: subscription.endpoint },
            update: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userId: req.user.id
            },
            create: {
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                userId: req.user.id
            }
        });

        res.status(201).json({ message: 'Subscribed' });
    } catch (error) {
        res.status(500).json({ message: 'Subscription failed' });
    }
});

module.exports = router;
