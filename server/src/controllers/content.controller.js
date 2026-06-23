const prisma = require('../lib/prisma');

// Get active courses for Barbers
exports.getCourses = async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: { active: true },
            orderBy: { order: 'asc' }
        });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get active banners for Dashboard or Client App
exports.getBanners = async (req, res) => {
    try {
        const { slug, barbershopId } = req.query;
        let queryWhere = { active: true };

        if (slug) {
            const barbershop = await prisma.barbershop.findUnique({ where: { slug } });
            if (barbershop) queryWhere.barbershopId = barbershop.id;
        } else if (barbershopId) {
            queryWhere.barbershopId = barbershopId;
        } else {
            // Global banners
            queryWhere.barbershopId = null;
        }

        const now = new Date();
        const banners = await prisma.banner.findMany({
            where: {
                ...queryWhere,
                OR: [
                    { startDate: null },
                    { startDate: { lte: now } }
                ],
                AND: [
                    {
                        OR: [
                            { endDate: null },
                            { endDate: { gte: now } }
                        ]
                    }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get unread updates for the user
exports.getUpdates = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find updates NOT read by user
        // Prisma doesn't support "where id NOT IN subquery" easily in one go efficiently without raw query or separate fetch
        // But for small scale, we can fetch all active updates and filter, or use where: none

        const updates = await prisma.systemUpdate.findMany({
            where: {
                active: true,
                readBy: {
                    none: { userId: userId }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(updates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark update as read
exports.markUpdateRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { updateId } = req.body;

        await prisma.userSystemUpdateRead.create({
            data: {
                userId,
                systemUpdateId: updateId
            }
        });

        res.json({ success: true });
    } catch (error) {
        // Ignore duplicate key error safely
        if (error.code === 'P2002') return res.json({ success: true });
        res.status(500).json({ message: error.message });
    }
};
