const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const todayCommon = new Date();
        const startOfDay = new Date(todayCommon.setHours(0, 0, 0, 0));
        const endOfDay = new Date(todayCommon.setHours(23, 59, 59, 999));

        // Optimized Queries using Prisma Raw SQL for Aggregations
        const [
            totalAppointments,
            revenueResult,
            clientsResult,
            todayAppointments
        ] = await Promise.all([
            // 1. Total Appointments Count (Standard Prisma is efficient for count)
            prisma.appointment.count({
                where: { professionalId: userId }
            }),

            // 2. Revenue (Sum of Service Price) - SQL Aggregation
            // "Service" table joins "Appointment"
            // Note: Adjust table names if Prisma maps them differently (e.g. lowercase). 
            // Prisma default is PascalCase models -> PascalCase or lowercase tables depending on DB.
            // Assuming standard Prisma naming: "Appointment", "Service"
            prisma.$queryRaw`
                SELECT SUM(s.price) as total 
                FROM "Appointment" a 
                JOIN "Service" s ON a."serviceId" = s.id 
                WHERE a."professionalId" = ${userId}
            `,

            // 3. Total Clients (Unique Count)
            prisma.$queryRaw`
                SELECT COUNT(DISTINCT "clientId") as count 
                FROM "Appointment" 
                WHERE "professionalId" = ${userId}
            `,

            // 4. Today's Appointments
            prisma.appointment.count({
                where: {
                    professionalId: userId,
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                }
            })
        ]);

        // Process Results
        // raw query returns array of objects, e.g. [{ total: 123.45 }]
        // values might be BigInt or Decimal

        const revenueRaw = revenueResult[0]?.total || 0;
        // Convert to number safely
        const revenue = Number(revenueRaw);

        // Client count
        // PostgreSQL COUNT returns BigInt, which JSON.stringify can't handle directly, so we Number() it.
        const clientsRaw = clientsResult[0]?.count || 0;
        const clientsCount = Number(clientsRaw);


        res.json({
            appointments: totalAppointments,
            revenue: revenue,
            clients: clientsCount,
            today: todayAppointments
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
