const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createTransaction = async (req, res) => {
    try {
        const { description, amount, type, category, date, barbershopId } = req.body;
        const bId = req.user.barbershopId || barbershopId;

        const transaction = await prisma.transaction.create({
            data: {
                description,
                amount: parseFloat(amount),
                type,
                category,
                date: date ? new Date(date) : new Date(),
                barbershopId: bId
            }
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;

        let where = {};

        // 1. Tenant Scope
        if (barbershopId) {
            where.barbershopId = barbershopId;
        } else {
            // If no ID, check if Super Admin
            if (req.user.role !== 'SUPER_ADMIN') {
                // For normal users, req.user.barbershopId should have been enforced or passed, 
                // but if we are here without an ID in query, fallback to user's shop if exists
                if (req.user.barbershopId) {
                    where.barbershopId = req.user.barbershopId;
                } else {
                    return res.status(400).json({ message: 'Barbershop ID required' });
                }
            }
            // If SUPER_ADMIN and no ID -> Global View (empty where.barbershopId)
        }

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' }
        });

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.transaction.delete({ where: { id } });
        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
