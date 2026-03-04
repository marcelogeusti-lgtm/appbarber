const prisma = require('../../lib/prisma');
const PaymentOrchestrator = require('./PaymentOrchestrator');

class SubscriptionEngine {
    /**
     * Starts a new subscription
     */
    async createSubscription(userId, planId, paymentData) {
        const { method, cardId, gateway = 'mercadopago', token, payer } = paymentData;

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            include: { barbershop: true }
        });

        if (!plan) throw new Error('Plano não encontrado');

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { authUser: true }
        });
        if (!user) throw new Error('Usuário não encontrado');

        let client = await prisma.client.findFirst({ where: { authUserId: userId } });
        if (!client) throw new Error('Perfil de cliente necessário');

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.validityDays);

        // 1. Create local record
        const subscription = await prisma.clientSubscription.create({
            data: {
                clientId: client.id,
                planId: plan.id,
                status: 'PENDING',
                startDate: new Date(),
                endDate: endDate,
                paymentMethod: method || 'CARD',
                remainingCuts: plan.quantityOfCuts
            }
        });

        try {
            let paymentResult;

            // 2. Decide flow: Recurring (Preapproval) or One-off
            if (plan.isRecurring && gateway === 'mercadopago') {
                console.log(`[SubscriptionEngine] Creating Recurring Preapproval for Plan ${plan.id}`);

                // Ensure Plan exists in Gateway
                if (!plan.externalId) {
                    const mpPlan = await PaymentOrchestrator.createSubscriptionPlan({
                        plan,
                        gateway,
                        barbershopId: plan.barbershopId
                    });
                    await prisma.subscriptionPlan.update({
                        where: { id: plan.id },
                        data: { externalId: mpPlan.id }
                    });
                    plan.externalId = mpPlan.id;
                }

                // Create preapproval subscription
                paymentResult = await PaymentOrchestrator.createSubscription({
                    planId: plan.externalId,
                    email: user.authUser?.email || user.email,
                    token,
                    gateway,
                    barbershopId: plan.barbershopId,
                    description: `Assinatura: ${plan.name}`
                });

                // Update local subscription with external reference
                await prisma.clientSubscription.update({
                    where: { id: subscription.id },
                    data: { externalId: paymentResult.id }
                });

            } else {
                // One-off payment flow
                console.log(`[SubscriptionEngine] Creating One-off Payment for Plan ${plan.id}`);
                paymentResult = await PaymentOrchestrator.createPayment({
                    amount: Number(plan.price),
                    method: method || 'CREDIT_CARD',
                    description: `Assinatura: ${plan.name}`,
                    barbershopId: plan.barbershopId,
                    gateway,
                    token,
                    customer: {
                        name: user.name,
                        email: user.authUser?.email || user.email,
                        phone: user.phone
                    },
                    externalId: subscription.id
                });

                // Link Payment
                await prisma.payment.create({
                    data: {
                        gateway: paymentResult.gateway,
                        method: method || 'CREDIT_CARD',
                        externalId: paymentResult.paymentId,
                        status: paymentResult.status || 'pending',
                        amount: plan.price,
                        userId,
                        clientSubscriptionId: subscription.id
                    }
                });
            }

            return {
                subscription,
                payment: paymentResult
            };

        } catch (e) {
            console.error('[SubscriptionEngine] Error:', e);
            await prisma.clientSubscription.update({
                where: { id: subscription.id },
                data: { status: 'CANCELLED' } // Instead of delete, mark as cancelled
            });
            throw e;
        }
    }

    async processWebhookUpdate(externalId, status) {
        // Logic to update subscription based on payment status
        const payment = await prisma.payment.findFirst({
            where: { externalId }
        });

        if (!payment) return;

        await prisma.payment.update({
            where: { id: payment.id },
            data: { status, paidAt: status === 'paid' ? new Date() : null }
        });

        if (payment.clientSubscriptionId && status === 'paid') {
            await prisma.clientSubscription.update({
                where: { id: payment.clientSubscriptionId },
                data: { status: 'ACTIVE' }
            });
        }
    }
}

module.exports = new SubscriptionEngine();
