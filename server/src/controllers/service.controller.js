const prisma = require('../lib/prisma');

exports.createService = async (req, res) => {
    try {
        const { name, description, price, duration, barbershopId, commissionType, commissionValue, overrides, isFeatured, imageUrl } = req.body;

        const effectiveBarbershopId = req.user.barbershopId || barbershopId;

        if (!effectiveBarbershopId) {
            return res.status(400).json({ message: 'Barbershop ID is required' });
        }

        const serviceData = {
            name,
            description,
            price: parseFloat(price),
            duration: parseInt(duration),
            barbershopId: effectiveBarbershopId,
            commissionType: commissionType || 'PERCENTAGE',
            commissionValue: commissionValue ? parseFloat(commissionValue) : 0,
            isFeatured: isFeatured || false,
            imageUrl
        };

        const service = await prisma.service.create({
            data: {
                ...serviceData,
                commissionOverrides: overrides && overrides.length > 0 ? {
                    create: overrides.map(o => ({
                        professionalId: o.professionalId,
                        type: o.type || serviceData.commissionType,
                        value: parseFloat(o.value)
                    }))
                } : undefined
            },
            include: { commissionOverrides: true }
        });

        res.status(201).json(service);
    } catch (error) {
        console.error('Create Service error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getServices = async (req, res) => {
    try {
        const { barbershopId, page = 1, limit = 50 } = req.query; // Higher default for services

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const p = parseInt(page);
        const l = parseInt(limit);
        const skip = (p - 1) * l;

        const where = { barbershopId, active: true };

        const [total, services] = await Promise.all([
            prisma.service.count({ where }),
            prisma.service.findMany({
                where,
                include: { commissionOverrides: true },
                skip,
                take: l
            })
        ]);

        res.json({
            data: services,
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, active, commissionType, commissionValue, overrides, isFeatured, imageUrl } = req.body;

        // Transaction to handle overrides update
        const service = await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            const updated = await tx.service.update({
                where: { id },
                data: {
                    name,
                    description,
                    price: price !== undefined ? parseFloat(price) : undefined,
                    duration: duration !== undefined ? parseInt(duration) : undefined,
                    active,
                    commissionType,
                    commissionValue: commissionValue !== undefined ? parseFloat(commissionValue) : undefined,
                    isFeatured: isFeatured !== undefined ? isFeatured : undefined,
                    imageUrl: imageUrl !== undefined ? imageUrl : undefined
                }
            });

            // 2. Handle overrides if provided (replace all)
            if (overrides !== undefined) {
                // Delete existing
                await tx.professionalServiceCommission.deleteMany({
                    where: { serviceId: id }
                });

                // Create new ones
                if (overrides.length > 0) {
                    await tx.professionalServiceCommission.createMany({
                        data: overrides.map(o => ({
                            serviceId: id,
                            professionalId: o.professionalId,
                            type: o.type || (commissionType || updated.commissionType),
                            value: parseFloat(o.value)
                        }))
                    });
                }
            }

            return updated; // Return updated service, maybe fetch overrides if needed
        });

        res.json(service);
    } catch (error) {
        console.error('Update Service error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // Logical delete
        await prisma.service.update({
            where: { id },
            data: { active: false }
        });

        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
