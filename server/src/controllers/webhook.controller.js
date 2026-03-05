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
        const result = await PaymentService.processWebhook(gateway, req);

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
