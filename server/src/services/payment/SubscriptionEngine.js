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

        let userProfile;
        let client;

        if (paymentData.role === 'CLIENT') {
            client = await prisma.client.findUnique({
                where: { id: userId },
                include: { authUser: true }
            });
            if (!client) throw new Error('Perfil de cliente não encontrado');
            userProfile = {
                name: client.name,
                email: client.authUser?.email || client.email,
                phone: client.phone
            };
        } else {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { authUser: true }
            });
            if (!user) throw new Error('Usuário não encontrado');
            userProfile = {
                name: user.name,
                email: user.authUser?.email || user.email,
                phone: user.phone
            };
            client = await prisma.client.findFirst({ where: { authUserId: userId } });
            if (!client) throw new Error('Perfil de cliente necessário para assinatura');
        }

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
            let success = false;
            let lastError;

            // 1. Get all available cards for this client if we need failover
            const savedCards = await prisma.cardToken.findMany({
                where: { 
                    clientId: client.id, 
                    gateway,
                    // If barbershopId is null, it's a platform card
                    OR: [
                        { barbershopId: plan.barbershopId },
                        { barbershopId: null }
                    ]
                },
                orderBy: { isDefault: 'desc' }
            });

            // Prepare list of cards to try starting with the requested one
            let cardsToTry = [];
            if (cardId) {
                const primaryCard = savedCards.find(c => c.id === cardId);
                if (primaryCard) {
                    cardsToTry = [primaryCard, ...savedCards.filter(c => c.id !== cardId)];
                } else {
                    // If cardId is actually a raw token (not UUID), just use it
                    cardsToTry = [{ token: cardId, id: 'raw' }];
                }
            } else if (token) {
                cardsToTry = [{ token: token, id: 'new' }, ...savedCards];
            } else {
                cardsToTry = savedCards;
            }

            // 2. Creation Loop with Failover
            for (const card of cardsToTry) {
                try {
                    console.log(`[SubscriptionEngine] Attempting subscription with card ${card.id} (last4: ${card.last4 || 'N/A'})`);
                    
                    if (plan.isRecurring && gateway === 'mercadopago') {
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
                            email: userProfile.email,
                            clientId: client.id,
                            token: card.token, 
                            amount: Number(plan.price),
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
                        paymentResult = await PaymentOrchestrator.createPayment({
                            amount: Number(plan.price),
                            method: method || 'CREDIT_CARD',
                            description: `Assinatura: ${plan.name}`,
                            barbershopId: plan.barbershopId,
                            gateway,
                            token: card.token,
                            customer: {
                                name: userProfile.name,
                                email: userProfile.email,
                                phone: userProfile.phone
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
                                userId: paymentData.role !== 'CLIENT' ? userId : null,
                                clientId: paymentData.role === 'CLIENT' ? userId : null,
                                clientSubscriptionId: subscription.id
                            }
                        });
                    }

                    success = true;
                    console.log(`[SubscriptionEngine] ✅ Subscription SUCCESS with card ${card.id}`);
                    break; // EXIT LOOP ON SUCCESS

                } catch (err) {
                    console.error(`[SubscriptionEngine] ❌ Attempt failed with card ${card.id}:`, err.message);
                    lastError = err;
                    // If it's the last card, the loop will end and we'll throw
                }
            }

            if (!success) {
                throw lastError || new Error('Falha ao processar assinatura com os cartões disponíveis.');
            }

            return {
                subscription,
                payment: paymentResult
            };

        } catch (e) {
            console.error('[SubscriptionEngine] Final Error:', e);
            await prisma.clientSubscription.update({
                where: { id: subscription.id },
                data: { status: 'CANCELLED' }
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
