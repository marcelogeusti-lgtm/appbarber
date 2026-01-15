const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { format } = require('date-fns');

exports.addToWaitlist = async (req, res) => {
    try {
        const {
            barbershopId,
            serviceId,
            professionalId,
            clientName,
            clientPhone,
            date, // Expected "YYYY-MM-DD"
            notes
        } = req.body;

        if (!date) return res.status(400).json({ message: 'Data é obrigatória.' });

        // Normalize date to mid-day or specific time to avoid timezone shifts on just "dates"
        // But schema says DateTime. Let's store as T12:00:00Z or similar to represent "That Day"
        // Better: Store exact requested date object
        const entryDate = new Date(date);

        const entry = await prisma.waitlist.create({
            data: {
                barbershopId,
                serviceId,
                professionalId: professionalId === 'all' ? null : professionalId,
                clientName,
                clientPhone,
                date: entryDate,
                notes,
                status: 'WAITING'
            }
        });

        res.status(201).json(entry);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao entrar na lista de espera.' });
    }
};

exports.getWaitlist = async (req, res) => {
    try {
        const { barbershopId, date, professionalId } = req.query;

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const where = {
            barbershopId,
            status: { in: ['WAITING', 'NOTIFIED'] }
        };

        if (date) {
            // Filter by day
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.date = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        if (professionalId && professionalId !== 'all') {
            where.professionalId = professionalId;
        }

        const list = await prisma.waitlist.findMany({
            where,
            include: {
                service: true,
                professional: true
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar lista de espera.' });
    }
};

exports.removeFromWaitlist = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.waitlist.update({
            where: { id },
            data: { status: 'CANCELLED' } // Soft delete basically
        });
        res.json({ message: 'Removido com sucesso.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao remover.' });
    }
};
