const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

        // 3. Business Logic: Update Payment & Subscription Status
        if (result.isValid && result.status === 'paid' && result.externalId) {
            const payment = await prisma.payment.findFirst({
                where: { externalId: result.externalId },
                include: { clientSubscription: true }
            });

            if (payment && payment.status !== 'paid') {
                await prisma.$transaction(async (tx) => {
                    // Update Payment
                    await tx.payment.update({
                        where: { id: payment.id },
                        data: { status: 'paid', paidAt: new Date() }
                    });

                    // Update Subscription if linked
                    if (payment.clientSubscriptionId) {
                        await tx.clientSubscription.update({
                            where: { id: payment.clientSubscriptionId },
                            data: { status: 'ACTIVE' }
                        });
                    }

                    // Update Order if linked
                    if (payment.orderId) {
                        await tx.order.update({
                            where: { id: payment.orderId },
                            data: { paymentStatus: 'PAID', status: 'CLOSED' }
                        });
                    }
                });
                console.log(`[Webhook] Successfully processed payment ${result.externalId}`);
            }
        }

        // 4. Update Log status
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
