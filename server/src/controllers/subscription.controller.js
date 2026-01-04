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
