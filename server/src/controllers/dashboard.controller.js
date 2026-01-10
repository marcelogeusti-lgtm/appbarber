const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
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
            totalAppointments, // Total lifetime appointments (keep for reference if needed, or remove if unused by frontend)
            todayRevenueResult,
            yesterdayRevenueResult,
            totalClientsCount, // Total unique clients
            todayAppointmentsCount,
            newClientsResult,
            totalRevenueResult // Added
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

            // 6. New Clients Today (First appointment ever created today)
            // This is an approximation. Ideally we check "Client" creation date, but if Client is shared, 
            // maybe "First appointment with this professional" is better. 
            // For now, let's count appointments today where it is the client's FIRST appointment with this pro.
            // OR simpler: Clients created today (if we track createdAt).
            // Assuming Client model has createdAt. Let's try to infer from appointments for robustness if Client doesn't track relative to Pro.
            // Let's stick to: Clients who had their FIRST appointment today.
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

            // 7. Total Revenue (Lifetime) - RESTORED
            prisma.$queryRaw`
                SELECT SUM(s.price) as total 
                FROM "Appointment" a 
                JOIN "Service" s ON a."serviceId" = s.id 
                WHERE a."professionalId" = ${userId}
                AND a.status != 'CANCELLED'
            `
        ]);

        // Process Revenue
        const revenueToday = Number(todayRevenueResult[0]?.total || 0);
        const revenueYesterday = Number(yesterdayRevenueResult[0]?.total || 0);
        const revenueTotal = Number(totalRevenueResult[0]?.total || 0); // Process total revenue

        // Calculate Trend
        let revenueTrend = "0% vs ontem";
        if (revenueYesterday > 0) {
            const percent = ((revenueToday - revenueYesterday) / revenueYesterday) * 100;
            const sign = percent >= 0 ? '+' : '';
            revenueTrend = `${sign}${percent.toFixed(0)}% vs ontem`;
        } else if (revenueToday > 0) {
            revenueTrend = "+100% vs ontem";
        }

        // Process Counts
        const clientsCount = Number(totalClientsCount[0]?.count || 0);
        const newClientsToday = Number(newClientsResult[0]?.count || 0);

        res.json({
            appointmentsTotal: totalAppointments,
            appointmentsToday: todayAppointmentsCount,
            revenueToday: revenueToday,
            revenueTotal: revenueTotal,
            revenueTrend: revenueTrend,
            clientsTotal: clientsCount,
            newClientsToday: newClientsToday
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
