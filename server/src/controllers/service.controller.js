const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createService = async (req, res) => {
    try {
        const { name, description, price, duration, barbershopId } = req.body;

        const effectiveBarbershopId = req.user.barbershopId || barbershopId;

        if (!effectiveBarbershopId) {
            return res.status(400).json({ message: 'Barbershop ID is required' });
        }

        const service = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                duration: parseInt(duration),
                barbershopId: effectiveBarbershopId
            }
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
            where: { barbershopId, active: true }
        });

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, duration, active } = req.body;

        const service = await prisma.service.update({
            where: { id },
            data: {
                name,
                description,
                price: price !== undefined ? parseFloat(price) : undefined,
                duration: duration !== undefined ? parseInt(duration) : undefined,
                active
            }
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
