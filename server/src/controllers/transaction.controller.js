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
        const bId = req.user.barbershopId || barbershopId;

        const where = { barbershopId: bId };
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
