const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const prisma = require('../utils/prisma'); // Adjust path to prisma client if needed, usually in utils or root

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
        // Continue even if logging fails? Usually yes, but critical to debug.
    }

    try {
        // 2. Process via Orchestrator
        const result = await PaymentOrchestrator.processWebhook(gateway, req);

        // 3. Update Log status
        if (logId) {
            await prisma.webhookLog.update({
                where: { id: logId },
                data: { processed: true }
            });
        }

        /* 
           IMMEDIATE TODO: 
           Here we should handle specific events like payment.success 
           to update local Order/Payment status.
           This will be done in the next implementation step (Business Logic Handlers).
        */

        return res.status(200).json({ received: true });

    } catch (error) {
        console.error(`[Webhook Error] ${gateway}:`, error.message);
        return res.status(400).json({ error: error.message });
    }
};
