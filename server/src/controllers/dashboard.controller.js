const prisma = require('../lib/prisma');

exports.getDashboardStats = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday);
        const endOfYesterday = new Date(new Date(yesterday).setHours(23, 59, 59, 999));

        // 1. Revenue and Attendance using Aggregations
        const [
            todayStats,
            yesterdayStats,
            totalRevenueResult,
            uniqueClientsCount,
            openCommandsCount,
            appointmentsTodayCount
        ] = await Promise.all([
            // Count Today's Appointments (instead of just closed orders)
            prisma.appointment.count({
                where: {
                    barbershopId,
                    date: { gte: startOfToday, lte: endOfToday },
                    status: { not: 'CANCELLED' }
                }
            }),
            // Total Lifetime Revenue
            prisma.order.aggregate({
                where: {
                    barbershopId,
                    status: { in: ['CLOSED', 'PAID'] }
                },
                _sum: { total: true }
            }),
            // Simpler unique clients via Prisma groupBy (much faster than giant queryRaw UNION)
            prisma.client.count({
                where: {
                    appointments: { some: { barbershopId } },
                    active: true
                }
            }),

            // Open Commands Count
            prisma.order.count({ where: { barbershopId, status: 'OPEN' } })
        ]);

        const revenueToday = todayStats._sum.total || 0;
        const revenueYesterday = yesterdayStats._sum.total || 0;
        const revenueTotal = totalRevenueResult._sum.total || 0;
        const clientsTotal = uniqueClientsCount || 0;
        const appointmentsToday = appointmentsTodayCount || 0;

        // Trend calculation
        let revenueTrend = "0% vs ontem";
        if (revenueYesterday > 0) {
            const percent = ((revenueToday - revenueYesterday) / revenueYesterday) * 100;
            revenueTrend = `${percent >= 0 ? '+' : ''}${percent.toFixed(0)}% vs ontem`;
        } else if (revenueToday > 0) {
            revenueTrend = "+100% vs ontem";
        }

        res.json({
            revenueToday,
            revenueTotal,
            revenueTrend,
            appointmentsToday,
            clientsTotal,
            openCommands: openCommandsCount
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Erro ao carregar estatísticas do painel.' });
    }
};
