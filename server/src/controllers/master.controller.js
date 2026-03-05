const prisma = require('../lib/prisma');

// --- COURSES ---

exports.listCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const data = req.body;
        const course = await prisma.course.create({ data });
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const course = await prisma.course.update({
            where: { id },
            data
        });
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.course.delete({ where: { id } });
        res.json({ message: 'Curso removido' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- BANNERS ---

exports.listBanners = async (req, res) => {
    try {
        const banners = await prisma.banner.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const data = req.body;
        // Ensure dates are parsed if string
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const banner = await prisma.banner.create({ data });
        res.status(201).json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        if (data.startDate) data.startDate = new Date(data.startDate);
        if (data.endDate) data.endDate = new Date(data.endDate);

        const banner = await prisma.banner.update({
            where: { id },
            data
        });
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.banner.delete({ where: { id } });
        res.json({ message: 'Banner removido' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- SYSTEM UPDATES ---

exports.listUpdates = async (req, res) => {
    try {
        const updates = await prisma.systemUpdate.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { readBy: true } } }
        });
        res.json(updates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createUpdate = async (req, res) => {
    try {
        const data = req.body;
        const update = await prisma.systemUpdate.create({ data });
        res.status(201).json(update);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteUpdate = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.systemUpdate.delete({ where: { id } });
        res.json({ message: 'Update removido' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.handleKiwiWebhook = async (req, res) => {
    try {
        const { order_status, customer, product } = req.body;

        console.log(`[Webhook Kiwi] Status: ${order_status} for ${customer?.email}`);

        // 1. Validate status (e.g., 'paid' or 'approved')
        if (order_status === 'paid' || order_status === 'approved') {
            const email = customer?.email;

            // 2. Find internal user (or create if needed, but usually redirect to register if not found)
            const authUser = await prisma.authUser.findUnique({
                where: { email },
                include: { user: true }
            });

            if (authUser) {
                // Logic: Link course to user or add tag
                // Note: We need a model for "UserCourses" or similar.
                // For now, we log the sale.
                console.log(`[Webhook Kiwi] Success: Linking Course to User ${authUser.id}`);
            } else {
                console.log(`[Webhook Kiwi] User not found: ${email}. Sale recorded for future linking.`);
            }
        }

        res.status(200).send('OK');
    } catch (error) {
        console.error('[Webhook Kiwi] Error:', error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// --- DASHBOARD STATS ---

const getPlanPrice = (planName) => {
    const plans = {
        'SOLO': 79.90,
        'BASIC': 109.90,
        'PRO': 164.50,
        'ENTERPRISE': 219.90
    };
    return plans[planName] || 0;
};

exports.getDashboardStats = async (req, res) => {
    try {
        const [totalBarbershops, activeBarbershops, provisioningCount] = await Promise.all([
            prisma.barbershop.count(),
            prisma.barbershop.findMany({
                where: { subscriptionStatus: 'ACTIVE' },
                select: { saasPlan: true }
            }),
            prisma.barbershop.count({
                where: { subscriptionStatus: { in: ['PENDING', 'TRIAL'] } }
            })
        ]);

        const mrr = activeBarbershops.reduce((acc, shop) => acc + getPlanPrice(shop.saasPlan), 0);

        // Mock Churn for now
        const churnRate = 2.5;

        res.json({
            activeUnits: totalBarbershops,
            mrr,
            provisioning: provisioningCount,
            churn: churnRate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleBarbershopStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const shop = await prisma.barbershop.findUnique({ where: { id } });

        if (!shop) return res.status(404).json({ message: 'Barbershop not found' });

        const newStatus = shop.subscriptionStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

        const updated = await prisma.barbershop.update({
            where: { id },
            data: { subscriptionStatus: newStatus }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
