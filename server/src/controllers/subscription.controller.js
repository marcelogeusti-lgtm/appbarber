const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');

// --- Barber/Shop Admin Actions ---

exports.createPlan = async (req, res) => {
    try {
        const { name, description, benefits, price, validityDays, barbershopId, quantityOfCuts, allowedMethods } = req.body;

        if (!name || !price || !barbershopId) {
            return res.status(400).json({ message: 'Nome, preço e barbearia são obrigatórios.' });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                description,
                benefits: Array.isArray(benefits) ? benefits : [],
                price: parseFloat(price),
                validityDays: parseInt(validityDays) || 30,
                quantityOfCuts: parseInt(quantityOfCuts) || 0,
                barbershopId,
                allowedMethods: allowedMethods || ['PIX', 'CREDIT_CARD'],
                active: true
            }
        });

        res.status(201).json(plan);
    } catch (error) {
        console.error('Create Plan Error:', error);
        res.status(500).json({ message: 'Erro ao criar plano de assinatura.' });
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
        const { planId, paymentMethod, gateway } = req.body;
        const authUserId = req.user.id;

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado.' });

        const client = await prisma.client.findUnique({ where: { authUserId } });
        if (!client) return res.status(404).json({ message: 'Cadastro de cliente não encontrado.' });

        // 1. Create a "PENDING" subscription record immediately
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.validityDays);

        const clientSub = await prisma.clientSubscription.create({
            data: {
                clientId: client.id,
                planId: plan.id,
                status: 'PENDING',
                startDate: new Date(),
                endDate: endDate,
                paymentMethod: paymentMethod || 'PIX',
                remainingCuts: plan.quantityOfCuts
            }
        });

        // 2. Process Initial Payment via Orchestrator
        try {
            const paymentResult = await PaymentOrchestrator.createPayment({
                amount: Number(plan.price),
                method: paymentMethod || 'PIX',
                description: `Assinatura: ${plan.name}`,
                gateway: gateway || 'velify', // Default
                barbershopId: plan.barbershopId,
                customer: {
                    name: client.name,
                    email: req.user.email,
                    phone: client.phone
                }
            });

            // 3. Link Payment to Subscription
            await prisma.payment.create({
                data: {
                    gateway: paymentResult.gateway,
                    method: paymentMethod || 'PIX',
                    externalId: paymentResult.externalId,
                    status: 'pending',
                    amount: plan.price,
                    userId: authUserId,
                    clientSubscriptionId: clientSub.id
                }
            });

            res.status(201).json({
                subscriptionId: clientSub.id,
                payment: {
                    qrCode: paymentResult.qrCode,
                    qrCodeBase64: paymentResult.qrCodeBase64,
                    clientSecret: paymentResult.clientSecret, // For Stripe
                    externalId: paymentResult.externalId
                }
            });
        } catch (payErr) {
            // Rollback sub if payment fails to initiate
            await prisma.clientSubscription.delete({ where: { id: clientSub.id } });
            throw payErr;
        }

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
