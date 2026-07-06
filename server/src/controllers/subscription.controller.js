const prisma = require('../lib/prisma');
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const SubscriptionEngine = require('../services/payment/SubscriptionEngine');
const { resetMonthlySubscriptions } = require('../workers/worker.subscription');

// --- Barber/Shop Admin Actions ---

exports.createPlan = async (req, res) => {
    try {
        let { name, description, benefits, price, validityDays, barbershopId, quantityOfCuts, allowedMethods, isRecurring } = req.body;

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
                isRecurring: Boolean(isRecurring),
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

// No JWT do cliente, `id` é o Client.id e `authUserId` é o AuthUser.id.
// Barbeiros/donos têm `id` = User.id — o Client deles é achado pelo authUserId.
async function resolveClient(reqUser) {
    if (reqUser.role === 'CLIENT') {
        return prisma.client.findUnique({ where: { id: reqUser.id } });
    }
    if (reqUser.authUserId) {
        return prisma.client.findUnique({ where: { authUserId: reqUser.authUserId } });
    }
    return null;
}

exports.getMyActiveSubscription = async (req, res) => {
    try {
        // Find corresponding client for the user
        const client = await resolveClient(req.user);

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

exports.subscribe = async (req, res) => {
    try {
        const { planId, cardId } = req.body;

        if (!planId || !cardId) {
            return res.status(400).json({ message: 'Plano e Cartão são obrigatórios.' });
        }

        // 1. Fetch Plan & Shop Context
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: planId },
            include: { barbershop: { include: { gatewayConfigs: true } } }
        });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado.' });

        // 2. Fetch Client (Client.id no JWT do cliente; authUserId para staff)
        const client = await resolveClient(req.user);
        if (!client) return res.status(404).json({ message: 'Perfil de cliente não encontrado.' });

        // 3. Fetch Saved CardToken
        const cardTokenRecord = await prisma.cardToken.findUnique({
            where: { id: cardId }
        });

        if (!cardTokenRecord) {
            return res.status(404).json({ message: 'Cartão não encontrado.' });
        }

        // Validate Ownership
        if (cardTokenRecord.clientId !== client.id) {
            return res.status(403).json({ message: 'Cartão inválido para este usuário.' });
        }

        // 4. Process Payment (Charge First Month) via PaymentOrchestrator
        // Note: usage of 'token' here is the saved Card ID (card_...)
        console.log(`[Subscription] Charging saved card ${cardId} for Plan ${plan.name} (${plan.price})`);

        const paymentResult = await PaymentOrchestrator.createPayment({
            method: 'credit_card',
            barbershopId: plan.barbershopId,
            clientId: client.id,
            amount: Number(plan.price),
            description: `Assinatura: ${plan.name} (Mensal)`,
            token: cardTokenRecord.token, // This is the 'card_...' ID from MP
            installments: 1,
            // customerId: cardTokenRecord.customerId (if we stored it, else Orchestrator finds it)
        });

        if (paymentResult.status !== 'approved' && paymentResult.status !== 'process_payment' && paymentResult.status !== 'paid') {
            // Note: MP 'status' is usually 'approved'. 'paid' is our internal map?
            // Let's check typical MP response. Orchestrator returns Normalized Status.
            // If it's pending (review) we might allow but warn. If rejected, stop.
            if (paymentResult.status === 'rejected' || paymentResult.status === 'cancelled') {
                return res.status(400).json({ message: 'Pagamento recusado. Tente outro cartão.' });
            }
        }

        // 5. Create Active Subscription
        const now = new Date();
        const nextBilling = new Date();
        nextBilling.setDate(now.getDate() + 30); // 30 Days Cycle default

        // Deactivate previous active subs for this shop/plan logic if needed?
        // Usually yes, one active sub per shop? Or per plan? Let's assume per Shop for now to avoid stacking.
        await prisma.clientSubscription.updateMany({
            where: {
                clientId: client.id,
                plan: { barbershopId: plan.barbershopId },
                status: 'ACTIVE'
            },
            data: { status: 'CANCELLED' }
        });

        const newSub = await prisma.clientSubscription.create({
            data: {
                clientId: client.id,
                planId: plan.id,
                status: 'ACTIVE',
                startDate: now,
                endDate: nextBilling, // Valid until next billing
                nextBillingDate: nextBilling,
                paymentMethod: 'CREDIT_CARD',
                remainingCuts: plan.quantityOfCuts,
                externalId: paymentResult.paymentId // Link to initial payment for reference
            }
        });

        res.status(201).json({
            subscription: newSub,
            message: 'Assinatura realizada com sucesso!'
        });

    } catch (error) {
        console.error('Direct Subscribe Error:', error);
        res.status(500).json({
            message: 'Erro ao processar assinatura.',
            details: error.message
        });
    }
};

exports.purchasePlan = async (req, res) => {
    try {
        const { planId, paymentMethod, gateway, token, payer } = req.body;
        const userId = req.user.id;

        if (!planId) {
            return res.status(400).json({ message: 'Plano é obrigatório.' });
        }

        console.log(`[SubscriptionController] Purchase requested for plan ${planId} by user ${userId}`);

        const result = await SubscriptionEngine.createSubscription(userId, planId, {
            method: paymentMethod,
            gateway: gateway || 'mercadopago',
            token,
            payer,
            role: req.user.role
        });

        res.status(201).json({
            subscriptionId: result.subscription.id,
            status: result.subscription.status,
            message: 'Assinatura processada com sucesso!',
            payment: result.payment
        });

    } catch (error) {
        console.error('Purchase Plan Error:', error);
        res.status(error.status || 500).json({ message: error.message || 'Erro ao processar assinatura.' });
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
// Cliente cancela a própria assinatura. Regra do negócio: ao cancelar,
// o acesso é revogado na hora (status CANCELLED + cortes zerados).
exports.cancelMySubscription = async (req, res) => {
    try {
        const { barbershopId } = req.body || {};

        const client = await resolveClient(req.user);
        if (!client) return res.status(404).json({ message: 'Perfil de cliente não encontrado.' });

        const sub = await prisma.clientSubscription.findFirst({
            where: {
                clientId: client.id,
                status: 'ACTIVE',
                ...(barbershopId ? { plan: { barbershopId } } : {})
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        });

        if (!sub) return res.status(404).json({ message: 'Nenhuma assinatura ativa encontrada.' });

        await prisma.clientSubscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELLED', remainingCuts: 0 }
        });

        console.log(`[Subscription] Client ${client.id} cancelled subscription ${sub.id} (${sub.plan?.name})`);
        res.json({ message: 'Assinatura cancelada. Os benefícios do plano foram encerrados.' });
    } catch (error) {
        console.error('Cancel My Subscription Error:', error);
        res.status(500).json({ message: 'Erro ao cancelar assinatura.' });
    }
};

// Staff cancela a assinatura de um cliente (ex.: pedido no balcão ou estorno manual)
exports.cancelClientSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const barbershopId = req.user.barbershopId || req.user.workedBarbershopId;

        const sub = await prisma.clientSubscription.findUnique({
            where: { id },
            include: { plan: true }
        });

        if (!sub) return res.status(404).json({ message: 'Assinatura não encontrada.' });
        if (sub.plan.barbershopId !== barbershopId && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Assinatura não pertence à sua barbearia.' });
        }
        if (sub.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Assinatura já está cancelada.' });
        }

        await prisma.clientSubscription.update({
            where: { id: sub.id },
            data: { status: 'CANCELLED', remainingCuts: 0 }
        });

        console.log(`[Subscription] Staff ${req.user.id} cancelled subscription ${sub.id}`);
        res.json({ message: 'Assinatura do cliente cancelada.' });
    } catch (error) {
        console.error('Cancel Client Subscription Error:', error);
        res.status(500).json({ message: 'Erro ao cancelar assinatura do cliente.' });
    }
};

exports.triggerReset = async (req, res) => {
    try {
        await resetMonthlySubscriptions();
        res.json({ message: 'Processo de reset iniciado com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao disparar reset.', error: error.message });
    }
};
