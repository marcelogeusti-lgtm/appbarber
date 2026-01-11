const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[Dashboard] Fetching stats for user: ${userId}`);

        const todayCommon = new Date();

        // Define Today's Range
        const startOfDay = new Date(todayCommon);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(todayCommon);
        endOfDay.setHours(23, 59, 59, 999);

        // Define Yesterday's Range
        const startOfYesterday = new Date(startOfDay);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(endOfDay);
        endOfYesterday.setDate(endOfYesterday.getDate() - 1);

        // Optimized Queries
        const [
            totalAppointments,
            todayRevenueResult,
            yesterdayRevenueResult,
            totalClientsCount,
            todayAppointmentsCount,
            newClientsResult,
            totalRevenueResult
        ] = await Promise.all([
            // 1. Total Appointments (Lifetime)
            prisma.appointment.count({
                where: { professionalId: userId }
            }),

            // 2. Today's Revenue
            prisma.$queryRaw`
                SELECT SUM(s.price) as total 
                FROM "Appointment" a 
                JOIN "Service" s ON a."serviceId" = s.id 
                WHERE a."professionalId" = ${userId}
                AND a.date >= ${startOfDay} AND a.date <= ${endOfDay}
                AND a.status != 'CANCELLED'
            `,

            // 3. Yesterday's Revenue
            prisma.$queryRaw`
                SELECT SUM(s.price) as total 
                FROM "Appointment" a 
                JOIN "Service" s ON a."serviceId" = s.id 
                WHERE a."professionalId" = ${userId}
                AND a.date >= ${startOfYesterday} AND a.date <= ${endOfYesterday}
                AND a.status != 'CANCELLED'
            `,

            // 4. Total Clients
            prisma.$queryRaw`
                SELECT COUNT(DISTINCT "clientId") as count 
                FROM "Appointment" 
                WHERE "professionalId" = ${userId}
            `,

            // 5. Today's Appointments
            prisma.appointment.count({
                where: {
                    professionalId: userId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    status: { not: 'CANCELLED' }
                }
            }),

            // 6. New Clients Today
            prisma.$queryRaw`
                SELECT COUNT(DISTINCT a."clientId") as count
                FROM "Appointment" a
                WHERE a."professionalId" = ${userId}
                AND a.date >= ${startOfDay} AND a.date <= ${endOfDay}
                AND a."clientId" NOT IN (
                    SELECT "clientId" 
                    FROM "Appointment" 
                    WHERE "professionalId" = ${userId} 
                    AND date < ${startOfDay}
                )
             `,

            // 7. Total Revenue (Lifetime)
            prisma.$queryRaw`
                SELECT SUM(s.price) as total 
                FROM "Appointment" a 
                JOIN "Service" s ON a."serviceId" = s.id 
                WHERE a."professionalId" = ${userId}
                AND a.status != 'CANCELLED'
            `
        ]);

        console.log('[Dashboard] Raw Revenue Results:', { today: todayRevenueResult, yesterday: yesterdayRevenueResult, total: totalRevenueResult });

        // Process Revenue with safe parsing
        const revenueToday = todayRevenueResult?.[0]?.total ? Number(todayRevenueResult[0].total) : 0;
        const revenueYesterday = yesterdayRevenueResult?.[0]?.total ? Number(yesterdayRevenueResult[0].total) : 0;
        const revenueTotal = totalRevenueResult?.[0]?.total ? Number(totalRevenueResult[0].total) : 0;

        // Calculate Trend
        let revenueTrend = "0% vs ontem";
        if (revenueYesterday > 0) {
            const percent = ((revenueToday - revenueYesterday) / revenueYesterday) * 100;
            const sign = percent >= 0 ? '+' : '';
            revenueTrend = `${sign}${percent.toFixed(0)}% vs ontem`;
        } else if (revenueToday > 0) {
            revenueTrend = "+100% vs ontem";
        }

        // Process Counts with safe parsing
        // BigInt handling: prisma $queryRaw returns BigInt for COUNT on some drivers/versions, ensure we convert to Number
        const parseCount = (res) => {
            const val = res?.[0]?.count;
            return val ? Number(val) : 0;
        };

        const clientsCount = parseCount(totalClientsCount);
        const newClientsToday = parseCount(newClientsResult);

        res.json({
            appointmentsTotal: totalAppointments,
            appointmentsToday: todayAppointmentsCount,
            revenueToday,
            revenueTotal,
            revenueTrend,
            clientsTotal: clientsCount,
            newClientsToday
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error fetching dashboard stats' });
    }
};
