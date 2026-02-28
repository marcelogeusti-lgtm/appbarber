const prisma = require('../lib/prisma');
const PaymentOrchestrator = require('./PaymentOrchestrator');

class SubscriptionEngine {
    /**
     * Starts a new subscription
     */
    async createSubscription(userId, planId, paymentData) {
        const { method, cardId, gateway } = paymentData;

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            include: { barbershop: true }
        });

        if (!plan) throw new Error('Plan not found');

        let client = await prisma.client.findUnique({ where: { authUserId: userId } });
        if (!client) throw new Error('Client profile required');

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
                paymentMethod: method,
                remainingCuts: plan.quantityOfCuts
            }
        });

        // 2. Process first payment
        try {
            const paymentResult = await PaymentOrchestrator.createPayment({
                amount: Number(plan.price),
                method,
                description: `Assinatura: ${plan.name}`,
                barbershopId: plan.barbershopId,
                gateway,
                customer: {
                    name: client.name,
                    email: user.email, // Need to pass user email
                    phone: client.phone
                }
            });

            // 3. Link Payment
            await prisma.payment.create({
                data: {
                    gateway: paymentResult.gateway,
                    method,
                    externalId: paymentResult.paymentId,
                    status: 'pending',
                    amount: plan.price,
                    userId,
                    clientSubscriptionId: subscription.id
                }
            });

            return {
                subscription,
                payment: paymentResult
            };
        } catch (e) {
            await prisma.clientSubscription.delete({ where: { id: subscription.id } });
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
