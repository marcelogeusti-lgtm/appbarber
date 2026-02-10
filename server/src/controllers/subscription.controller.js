const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');

// --- Barber/Shop Admin Actions ---

exports.createPlan = async (req, res) => {
    try {
        let { name, description, benefits, price, validityDays, barbershopId, quantityOfCuts, allowedMethods } = req.body;

        if (!name || price === undefined || price === null || !barbershopId) {
            return res.status(400).json({ message: 'Nome, preço e barbearia são obrigatórios.' });
        }

        const priceNumber = parseFloat(price);
        if (isNaN(priceNumber)) {
            return res.status(400).json({ message: 'O preço deve ser um número válido.' });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description,
                benefits: Array.isArray(benefits) ? benefits : [],
                price: priceNumber,
                validityDays: parseInt(validityDays) || 30,
                quantityOfCuts: parseInt(quantityOfCuts) || 0,
                barbershopId,
                allowedMethods: allowedMethods || ['PIX', 'CREDIT_CARD'],
                active: true
            }
        });

        console.log('[Subscription] Plan created successfully:', plan.id);
        res.status(201).json(plan);
    } catch (error) {
        console.error('Create Plan Error Details:', {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Erro ao criar plano de assinatura.',
            error: error.message,
            code: error.code
        });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const plans = await prisma.subscriptionPlan.findMany({
            where: { barbershopId, active: true },
            orderBy: { price: 'asc' }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar planos.' });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        // Instead of hard delete, we often deactivate to keep history
        await prisma.subscriptionPlan.update({
            where: { id },
            data: { active: false }
        });
        res.json({ message: 'Plano desativado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover plano.' });
    }
};

exports.getSubscribers = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId || req.user.workedBarbershopId;

        const subscribers = await prisma.clientSubscription.findMany({
            where: { plan: { barbershopId } },
            include: {
                client: true,
                plan: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(subscribers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar assinantes.' });
    }
};

// --- Client / Purchase Actions ---

exports.getMyActiveSubscription = async (req, res) => {
    try {
        // Find corresponding client for the user
        const client = await prisma.client.findUnique({
            where: { authUserId: req.user.id }
        });

        if (!client) return res.json(null);

        const sub = await prisma.clientSubscription.findFirst({
            where: {
                clientId: client.id,
                status: 'ACTIVE',
                endDate: { gte: new Date() }
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sub);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar assinatura ativa.' });
    }
};

exports.purchasePlan = async (req, res) => {
    try {
        const { planId, paymentMethod, gateway, token, payer, cardToken } = req.body; // cardToken vem do CardForm
        const authUserId = req.user.id;

        const effectiveCardToken = token || cardToken; // Fallback

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId }, include: { barbershop: { include: { gatewayConfigs: true } } } });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado.' });

        let client = await prisma.client.findUnique({ where: { authUserId } });

        // Auto-create client profile if missing
        if (!client) {
            console.log(`[Subscription] Client profile missing for user ${authUserId}. Creating one...`);
            const authUser = await prisma.authUser.findUnique({
                where: { id: authUserId },
                include: { user: true }
            });

            client = await prisma.client.create({
                data: {
                    authUserId,
                    name: authUser?.user?.name || authUser?.email?.split('@')[0] || 'Cliente',
                    phone: authUser?.user?.phone || null
                }
            });
        }

        // Get Credentials
        const gatewayType = gateway || 'mercadopago'; // Default to MP for subs
        if (gatewayType !== 'mercadopago') {
            return res.status(400).json({ message: 'Assinaturas automáticas suportadas apenas no Mercado Pago.' });
        }

        const credentials = plan.barbershop.gatewayConfigs?.find(c => c.gateway.toLowerCase() === 'mercadopago')?.credentials;
        const adapter = PaymentOrchestrator.getAdapter('mercadopago');

        // 1. Ensure Plan exists in MP
        let mpPlanId = plan.externalId;
        if (!mpPlanId) {
            console.log(`[Subscription] Plan ${plan.name} has no external ID. Creating in MP...`);
            const mpPlan = await adapter.createSubscriptionPlan({ plan, credentials });
            mpPlanId = mpPlan.id;

            // Update local plan
            await prisma.subscriptionPlan.update({
                where: { id: plan.id },
                data: { externalId: mpPlanId.toString() }
            });
        }

        // 2. Create Subscription in MP
        if (!effectiveCardToken) {
            return res.status(400).json({ message: 'Token do cartão é obrigatório para assinar.' });
        }

        const mpSub = await adapter.createSubscription({
            planId: mpPlanId,
            cardToken: effectiveCardToken,
            payerEmail: req.user.email,
            externalReference: authUserId, // Track user
            credentials
        });

        if (mpSub.status !== 'authorized') {
            throw new Error(`Assinatura não autorizada. Status: ${mpSub.status}`);
        }

        // 3. Create Subscription Record
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.validityDays);

        const clientSub = await prisma.clientSubscription.create({
            data: {
                clientId: client.id,
                planId: plan.id,
                status: 'ACTIVE', // Assumes authorized immediately
                startDate: new Date(),
                endDate: endDate,
                paymentMethod: 'CREDIT_CARD', // Subscriptions are card-based
                remainingCuts: plan.quantityOfCuts,
                externalId: mpSub.subscriptionId.toString()
            }
        });

        // 4. Record Initial Payment (Optional, or wait for webhook)
        // MP Create Subscription might NOT charge immediately (depends on start_date), 
        // but usually does. For reconciliation, better to wait for webhook 'subscription_authorized_payment'.
        // However, user expects feedback.

        res.status(201).json({
            subscriptionId: clientSub.id,
            status: 'ACTIVE',
            message: 'Assinatura realizada com sucesso!'
        });

    } catch (error) {
        console.error('Purchase Plan Error:', error);
        res.status(500).json({ message: error.message || 'Erro ao processar assinatura.' });
    }
};

exports.assignPlanToClient = async (req, res) => {
    try {
        const { clientId, planId } = req.body;

        if (!clientId || !planId) {
            return res.status(400).json({ message: 'Cliente e Plano são obrigatórios' });
        }

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado' });

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.validityDays);

        // Deactivate others
        await prisma.clientSubscription.updateMany({
            where: { clientId, status: 'ACTIVE', plan: { barbershopId: plan.barbershopId } },
            data: { status: 'CANCELLED' }
        });

        const sub = await prisma.clientSubscription.create({
            data: {
                clientId,
                planId,
                startDate: new Date(),
                endDate,
                remainingCuts: plan.quantityOfCuts,
                status: 'ACTIVE'
            }
        });

        res.status(201).json(sub);
    } catch (error) {
        console.error('Assign Plan Error:', error);
        res.status(500).json({ message: 'Erro ao atribuir plano.' });
    }
};
