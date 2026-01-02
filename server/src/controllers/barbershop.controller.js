const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Public: Search Barbershops
exports.searchBarbershops = async (req, res) => {
    try {
        const { term, type } = req.query; // type: NAME, CITY, NEARBY

        let where = {};

        if (term) {
            const lowerTerm = term.toLowerCase();
            // Ideally use full-text search or ILIKE if Postgres
            // For simplicity/Prisma SQLite/MySQL compatibility often contains is used

            if (type === 'CITY') {
                where = { address: { contains: term } };
            } else {
                // Default NAME or generic search
                where = {
                    OR: [
                        { name: { contains: term } },
                        { address: { contains: term } }
                    ]
                };
            }
        }

        const barbershops = await prisma.barbershop.findMany({
            where,
            include: {
                services: { take: 1 }, // Show at least one service/price
            },
            take: 20
        });

        res.json(barbershops);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Public: Get Barbershop by Slug
exports.getBarbershopBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const barbershop = await prisma.barbershop.findUnique({
            where: { slug },
            include: {
                services: true,
                staff: {
                    where: { role: 'BARBER' },
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        role: true,
                        professionalProfile: {
                            select: { position: true, bio: true }
                        }
                    }
                }
            }
        });

        if (!barbershop) {
            return res.status(404).json({ message: 'Barbershop not found' });
        }

        res.json(barbershop);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: Update Barbershop
exports.updateBarbershop = async (req, res) => {
    try {
        const { id } = req.params; // or derived from user token
        const { name, address, phone, slug, webhookUrl } = req.body;

        // Check ownership
        // Ideally use req.user.barbershopId or check ownerId
        const barbershop = await prisma.barbershop.findUnique({ where: { id } });
        if (!barbershop) return res.status(404).json({ message: 'Not found' });

        if (barbershop.ownerId !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const updated = await prisma.barbershop.update({
            where: { id },
            data: { name, address, phone, slug, webhookUrl }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin: List Barbershops
exports.listBarbershops = async (req, res) => {
    try {
        const barbershops = await prisma.barbershop.findMany({
            include: { owner: { select: { name: true, email: true } } }
        });
        res.json(barbershops);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
