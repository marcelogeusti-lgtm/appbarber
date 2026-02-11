const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TransactionService = require('../services/TransactionService');

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
        // 3. Business Logic: Update Payment & Subscription Status
        const isPaid = result.status === 'paid' || result.status === 'APPROVED';

        if (result.isValid && isPaid && result.externalId) {
            let payment;

            if (result.isInternalId) {
                payment = await prisma.payment.findUnique({
                    where: { id: result.externalId },
                    include: { clientSubscription: true }
                });
            } else {
                payment = await prisma.payment.findFirst({
                    where: { externalId: result.externalId },
                    include: { clientSubscription: true }
                });
            }

            if (payment && payment.status !== 'paid') {
                await prisma.$transaction(async (tx) => {
                    // Update Payment Status first
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

                    // Register Financial Transaction & Update Order/Appointment (Idempotent)
                    // We need to pass the amount. Payment record has it.
                    await TransactionService.createTransaction({
                        barbershopId: payment.barbershopId, // Ensure payment has this field or fetch it
                        amount: Number(payment.amount),
                        method: payment.method === 'pix' ? 'PIX' : 'CREDIT_CARD', // Map correctly
                        origin: 'ONLINE',
                        appointmentId: payment.appointmentId,
                        orderId: payment.orderId,
                        professionalId: null, // Let Service resolve it
                        description: `Pagamento Online (Webhook) - ${payment.method} - #${payment.externalId}`
                    }, tx);

                });
                console.log(`[Webhook] Successfully processed payment ${result.externalId}`);
            }
        } else if (result.isValid && result.isSubscription && result.externalId) {
            // Tratamento Específico para Assinatura (Mudanla de Status via Preapproval)
            const subscription = await prisma.clientSubscription.findFirst({
                where: { externalId: result.externalId }
            });

            if (subscription) {
                let newStatus = result.status; // ACTIVE, OVERDUE, CANCELLED, PENDING

                // Mapeamento simples para garantir enum
                const validStatuses = ['PENDING', 'ACTIVE', 'OVERDUE', 'CANCELLED', 'INACTIVE'];
                if (!validStatuses.includes(newStatus)) newStatus = 'PENDING';

                if (subscription.status !== newStatus) {
                    await prisma.clientSubscription.update({
                        where: { id: subscription.id },
                        data: { status: newStatus }
                    });
                    console.log(`[Webhook] Atualizado status da assinatura ${subscription.id} para ${newStatus}`);
                }
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
