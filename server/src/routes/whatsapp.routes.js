const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/auth.middleware');
const masterMiddleware = require('../middlewares/master.middleware'); // se for super-admin apenas

// Provider de WA do projeto
const whatsAppProvider = require('../services/communication/providers/WhatsAppProvider');

// GET /api/whatsapp/status
// Retorna o status de conexao e o QR Code em base64 caso esteja aguardando leitura
router.get('/status', checkAuth, async (req, res) => {
    try {
        const data = await whatsAppProvider.getStatus();
        res.json(data);
    } catch (error) {
        console.error('Failed to get WA Status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Outros comandos no WA (Logout, Reiniciar Session, etc) poderiam vir daqui

module.exports = router;
