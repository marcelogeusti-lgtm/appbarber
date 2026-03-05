const prisma = require('../lib/prisma');

exports.createService = async (req, res) => {
    try {
        const { name, description, price, duration, barbershopId, commissionType, commissionValue, overrides, isFeatured } = req.body;

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
            isFeatured: isFeatured || false
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
        const { barbershopId } = req.query; // public or private access

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const services = await prisma.service.findMany({
            where: { barbershopId, active: true },
            include: { commissionOverrides: true }
        });

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, active, commissionType, commissionValue, overrides, isFeatured } = req.body;

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
                    isFeatured: isFeatured !== undefined ? isFeatured : undefined
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
