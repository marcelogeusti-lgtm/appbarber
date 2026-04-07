const express = require('express');
const router = express.Router();
const googleCalendarService = require('../services/communication/GoogleCalendarService');
const whatsAppProvider = require('../services/communication/providers/WhatsAppProvider');
const { protect, authorize } = require('../middlewares/auth.middleware');
const internalNotifier = require('../services/notificationService/internalNotifier');

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

// Google Calendar Mass Notification (Admin only)
router.post('/google/notify-all', protect, authorize('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
    try {
        const prisma = require('../lib/prisma');
        const users = await prisma.user.findMany({
            where: {
                googleTokens: { not: null }
            },
            select: { id: true }
        });

        console.log(`[Integration] 📢 Sending maintenance notification to ${users.length} users.`);

        for (const user of users) {
            await internalNotifier.createGoogleSyncErrorNotification(
                user.id,
                'Precisamos atualizar sua conexão para garantir que a sincronização automática funcione sempre.'
            );
        }

        res.json({ message: `Notificação enviada para ${users.length} profissionais.` });
    } catch (error) {
        console.error('Error sending mass notification:', error);
        res.status(500).json({ message: 'Falha ao enviar notificações em massa.' });
    }
});

// Google Calendar Connection Status
router.get('/google/status', protect, async (req, res) => {
    try {
        const status = await googleCalendarService.checkConnectionStatus(req.user.id);
        res.json(status);
    } catch (error) {
        res.status(500).json({ connected: false, message: 'Erro ao verificar status' });
    }
});

// Google Calendar OAuth Callback
router.get('/google/callback', async (req, res) => {
    const { code, state, error } = req.query; // state is professionalId
    
    if (error) {
        console.error('[GoogleCallback] Auth Error:', error);
        return res.send(`
            <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f4f4f5;">
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                        <h1 style="color: #ef4444;">Falha na Conexão</h1>
                        <p>\${error === 'access_denied' ? 'A permissão foi negada.' : 'Ocorreu um erro ao autorizar o acesso.'}</p>
                        <button onclick="window.close()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Fechar Janela</button>
                    </div>
                </body>
            </html>
        `);
    }

    try {
        await googleCalendarService.handleCallback(code, state);

        res.send(`
            <html>
                <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f4f4f5;">
                    <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                        <h1 style="color: #10b981;">Conectado com Sucesso!</h1>
                        <p>Sua agenda do Google agora está sincronizada.</p>
                        <p style="font-size: 0.8rem; color: #71717a;">Esta janela fechará automaticamente...</p>
                        <script>
                            setTimeout(() => {
                                if (window.opener) {
                                    window.opener.postMessage('google-connected', '*');
                                }
                                window.close();
                            }, 2000);
                        </script>
                    </div>
                </body>
            </html>
        `);
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
