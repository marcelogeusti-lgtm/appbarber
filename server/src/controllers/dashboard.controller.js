const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const todayCommon = new Date();
        // Set to beginning of today (local time assumption or UTC? Server is likely UTC, but let's try to match "Today" logic)
        // Usually best to use startOfDay and endOfDay
        const startOfDay = new Date(todayCommon.setHours(0, 0, 0, 0));
        const endOfDay = new Date(todayCommon.setHours(23, 59, 59, 999));

        // Using Promise.all for parallel execution
        const [totalAppointments, appointmentsWithService, totalClients, todayAppointments] = await Promise.all([
            // 1. Total Appointments (Count)
            prisma.appointment.count({
                where: { professionalId: userId }
            }),

            // 2. Revenue (Sum of service price) - Replicating current logic: All appointments for this pro
            // We fetch service price for all appointments. 
            // Aggregation in Prisma for related fields is tricky if not directly on the model.
            // Since Service price is on Service model, we can't do aggregate on Appointment directly for it easily without join.
            // But we can aggregate Order total if we trust it.
            // Existing code: appointments.reduce((acc, curr) => acc + Number(curr?.service?.price || 0), 0)
            // Let's rely on Order table if possible? 
            // "order" table has "total". 
            // Let's try to fetch Order sums. 
            // But wait, existing code ignores products.
            // If I switch to Order, it includes products. 
            // To be safe and identical, I will fetch appointments with select service price.
            // This is still O(N) but only fetching one field, much lighter than full json.
            // ACTUALLY: Prisma aggregate doesn't support relations.
            // Let's execute raw SQL or just fetch ids and prices.
            prisma.appointment.findMany({
                where: { professionalId: userId },
                select: {
                    service: {
                        select: {
                            price: true
                        }
                    }
                }
            }),

            // 3. Total Clients (Unique)
            prisma.appointment.findMany({
                where: { professionalId: userId },
                distinct: ['clientId'],
                select: { clientId: true }
            }),

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

        // Calculate Revenue in JS from the lighter payload
        // Decimal to Number
        const revenue = appointmentsWithService.reduce((acc, curr) => {
            return acc + (Number(curr.service?.price) || 0);
        }, 0);

        const clientsCount = totalClients.length;

        // Structure matches what the frontend expects or better?
        // Frontend expects: { appointments: number, revenue: number, clients: number, today: number }

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
