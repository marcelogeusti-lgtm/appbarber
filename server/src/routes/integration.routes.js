const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/communication/GoogleCalendarService');
const whatsAppProvider = require('../services/communication/providers/WhatsAppProvider');
const { protect } = require('../middlewares/auth.middleware');

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

module.exports = router;
