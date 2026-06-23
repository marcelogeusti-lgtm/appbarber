const PaymentService = require('../services/payment/PaymentService');
const prisma = require('../lib/prisma');

exports.handleWebhook = async (req, res) => {
    const { gateway } = req.params;

    // 1. Log Raw Webhook
    let logId;
    try {
        const log = await prisma.webhookLog.create({
            data: {
                gateway,
                event: req.body?.type || req.body?.action || 'unknown',
                payload: req.body || {},
                processed: false
            }
        });
        logId = log.id;
    } catch (err) {
        console.error('Failed to log webhook:', err);
    }

    try {
        // 2. Process via Service
        console.log(`[Webhook] Incoming from ${gateway}`);
        
        let result = null;
        if (gateway === 'evolution') {
            // It's a WhatsApp webhook from Evolution API
            const CommunicationService = require('../services/communication/CommunicationService');
            
            // Evolution API Payload structure for messages.upsert
            if (req.body && req.body.event === 'messages.upsert') {
                const messageData = req.body.data;
                const instance = req.body.instance;
                
                // Only process text messages that are not from the bot itself
                if (messageData && messageData.message && !messageData.key.fromMe) {
                    const text = messageData.message.conversation || messageData.message.extendedTextMessage?.text;
                    if (text) {
                        const formattedData = {
                            from: messageData.key.remoteJid,
                            name: messageData.pushName || 'Desconhecido',
                            text: text,
                            instance: instance
                        };
                        result = await CommunicationService.handleIncomingMessage(formattedData);
                    }
                }
            } else if (req.body && req.body.event === 'connection.update') {
                // E.g., qr, open, close
                // We can use this to update the DB status if needed without polling
                const instance = req.body.instance;
                const state = req.body.data?.state;
                if (state === 'open' || state === 'close') {
                    await prisma.barbershop.updateMany({
                        where: { slug: instance },
                        data: { whatsappStatus: state === 'open' ? 'CONNECTED' : 'DISCONNECTED' }
                    });
                }
            }
        } else if (gateway === 'kiwify' || gateway === 'kirvano') {
            // It's a SaaS Webhook (Kiwify / Kirvano)
            const SaaSWebhookService = require('../services/payment/SaaSWebhookService');
            if (gateway === 'kiwify') {
                result = await SaaSWebhookService.processKiwify(req);
            } else {
                result = await SaaSWebhookService.processKirvano(req);
            }
        } else {
            // It's a Payment Gateway Webhook (Mercado Pago, Stripe, etc.)
            result = await PaymentService.processWebhook(gateway, req);
        }

        // 3. Update Log
        if (logId) {
            await prisma.webhookLog.update({
                where: { id: logId },
                data: {
                    processed: true,
                    // Optionally store a snippet of result or error
                }
            });
        }

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error(`[Webhook Error] ${gateway}:`, error.message);
        // We still return 200/OK if validation passed but inner logic failed,
        // to prevent gateway from retrying endlessly if it's a code error.
        // But if it's a signature error, return 400.
        return res.status(gateway === 'mercadopago' ? 200 : 400).json({ error: error.message });
    }
};
