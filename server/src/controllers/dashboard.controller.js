const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

        // 1. Revenue and Attendance (Based on Orders CLOSED/PAID)
        const [
            todayOrders,
            yesterdayOrders,
            totalRevenueResult,
            uniqueClientsResult
        ] = await Promise.all([
            // Today's Orders
            prisma.order.findMany({
                where: {
                    barbershopId,
                    status: { in: ['CLOSED', 'PAID'] },
                    updatedAt: { gte: startOfToday, lte: endOfToday }
                }
            }),
            // Yesterday's Orders
            prisma.order.findMany({
                where: {
                    barbershopId,
                    status: { in: ['CLOSED', 'PAID'] },
                    updatedAt: { gte: startOfYesterday, lte: endOfYesterday }
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
            // Real Clients (Unique IDs with history)
            // Rule: Has at least one appointment OR one order OR one manual entry (CommunicationLog)
            prisma.$queryRaw`
                SELECT COUNT(DISTINCT "clientId") as count FROM (
                    SELECT "clientId" FROM "Appointment" WHERE "barbershopId" = ${barbershopId}
                    UNION
                    SELECT "clientId" FROM "Order" WHERE "barbershopId" = ${barbershopId} AND "status" IN ('CLOSED', 'PAID')
                    UNION
                    SELECT "clientId" FROM "CommunicationLog" WHERE "barbershopId" = ${barbershopId}
                ) as all_links
            `
        ]);

        const revenueToday = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const revenueYesterday = yesterdayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const revenueTotal = totalRevenueResult._sum.total || 0;
        const clientsTotal = Number(uniqueClientsResult[0]?.count || 0);

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
            appointmentsToday: todayOrders.length, // Count of finalized orders
            clientsTotal,
            // Add open commands count for convenience
            openCommands: await prisma.order.count({ where: { barbershopId, status: 'OPEN' } })
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Erro ao carregar estatísticas do painel.' });
    }
};
