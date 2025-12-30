const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFinancialStats = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const where = {
            barbershopId,
            status: 'COMPLETED', // Or check appointments in general if user wants revenue forecast
        };

        if (startDate && endDate) {
            where.date = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const [appointments, transactions] = await Promise.all([
            prisma.appointment.findMany({
                where,
                include: { service: true, professional: { select: { id: true, name: true } } }
            }),
            prisma.transaction.findMany({
                where: {
                    barbershopId,
                    date: where.date
                }
            })
        ]);

        // Calculate Revenue from Appointments
        const appointmentRevenue = appointments.reduce((acc, curr) => acc + Number(curr.service.price), 0);

        // Calculate Transactions
        const otherIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + Number(curr.amount), 0);

        const totalGrossRevenue = appointmentRevenue + otherIncome;

        // Commissions (Simulated: 50% for the barber)
        const commissions = appointments.reduce((acc, curr) => {
            const proName = curr.professional.name;
            const value = Number(curr.service.price) * 0.5; // 50% commission
            acc[proName] = (acc[proName] || 0) + value;
            return acc;
        }, {});

        const totalCommissions = Object.values(commissions).reduce((acc, curr) => acc + curr, 0);

        // Net Profit = Revenue - Commissions - Expenses
        const netProfit = totalGrossRevenue - totalCommissions - totalExpenses;

        res.json({
            totalRevenue: totalGrossRevenue,
            appointmentRevenue,
            otherIncome,
            totalExpenses,
            netProfit,
            totalAppointments: appointments.length,
            commissions: Object.entries(commissions).map(([name, value]) => ({ name, value })),
            appointments: appointments.slice(0, 10), // Limit for preview
            transactions: transactions.slice(0, 10)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
