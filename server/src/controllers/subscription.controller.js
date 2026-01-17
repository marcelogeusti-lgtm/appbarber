const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPlan = async (req, res) => {
    try {
        const { name, price, quantityOfCuts, validityDays, barbershopId } = req.body;

        const plan = await prisma.subscriptionPlan.create({
            data: {
                name,
                price: parseFloat(price),
                quantityOfCuts: parseInt(quantityOfCuts),
                validityDays: parseInt(validityDays),
                barbershopId
            }
        });

        res.status(201).json(plan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating subscription plan' });
    }
};

exports.getPlans = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        const plans = await prisma.subscriptionPlan.findMany({
            where: { barbershopId }
        });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching plans' });
    }
};

exports.deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.subscriptionPlan.delete({ where: { id } });
        res.json({ message: 'Plan deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting plan' });
    }
};

exports.getMyActiveSubscription = async (req, res) => {
    try {
        const sub = await prisma.userSubscription.findFirst({
            where: {
                userId: req.user.id,
                status: 'ACTIVE',
                endDate: { gte: new Date() }
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(sub);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active subscription' });
    }
};

exports.purchasePlan = async (req, res) => {
    try {
        const { planId, paymentMethod } = req.body;
        const userId = req.user.id;

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado' });

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.validityDays);

        // Create Subscription
        const sub = await prisma.userSubscription.create({
            data: {
                userId,
                planId,
                startDate,
                endDate,
                remainingCuts: plan.quantityOfCuts,
                status: 'ACTIVE'
            }
        });

        // Optional: Record Transaction (income)
        await prisma.transaction.create({
            data: {
                description: `Compra de Plano: ${plan.name}`,
                amount: plan.price,
                type: 'INCOME',
                category: 'SUBSCRIPTION',
                barbershopId: plan.barbershopId,
                date: new Date()
            }
        });

        res.status(201).json(sub);
    } catch (error) {
        console.error('Purchase Plan Error:', error);
        res.status(500).json({ message: 'Erro ao processar compra do plano' });
    }
};

exports.getSubscribers = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId;

        const subscribers = await prisma.userSubscription.findMany({
            where: {
                plan: {
                    barbershopId
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                plan: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format for frontend
        const formatted = subscribers.map(sub => ({
            id: sub.user.id,
            name: sub.user.name,
            plan: sub.plan.name,
            joined: sub.startDate,
            expiry: sub.endDate,
            ltv: sub.plan.price, // Simplified LTV for now
            status: sub.status,
            remainingCuts: sub.remainingCuts
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching subscribers' });
    }
};

exports.assignPlanToClient = async (req, res) => {
    try {
        const { clientId, planId } = req.body;

        // Validation
        if (!clientId || !planId) {
            return res.status(400).json({ message: 'Cliente e Plano são obrigatórios' });
        }

        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan) return res.status(404).json({ message: 'Plano não encontrado' });

        const client = await prisma.user.findUnique({ where: { id: clientId } });
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado' });

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.validityDays);

        // Deactivate previous active subscriptions for this barbershop?
        // Logic: A user can have only one active subscription per barbershop usually.
        // Let's deactivate others.
        await prisma.userSubscription.updateMany({
            where: {
                userId: clientId,
                status: 'ACTIVE',
                plan: { barbershopId: plan.barbershopId }
            },
            data: { status: 'CANCELED' }
        });

        // Create Subscription
        const sub = await prisma.userSubscription.create({
            data: {
                userId: clientId,
                planId,
                startDate,
                endDate,
                remainingCuts: plan.quantityOfCuts,
                status: 'ACTIVE'
            }
        });

        // Log Transaction (Manual assignment usually implies payment handled elsewhere or cash)
        // We won't auto-create transaction unless requested, or create as "PENDING" payment?
        // User request: "SUBSCRIPTION CREATION IS FAILING... Requires a valid clientId"
        // Let's assume this is the fix for that flow.

        res.status(201).json(sub);

    } catch (error) {
        console.error('Assign Plan Error:', error);
        res.status(500).json({ message: 'Erro ao atribuir plano ao cliente' });
    }
};
