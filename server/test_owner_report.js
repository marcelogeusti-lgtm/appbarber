const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("--- TESTING OWNER REPORT LOGIC ---");
    try {
        const email = 'marcelogeusti@gmail.com';
        const authUser = await prisma.authUser.findUnique({
            where: { email },
            include: { user: true }
        });

        if (!authUser || !authUser.user) {
            console.log("No user found for email:", email);
            return;
        }

        const user = authUser.user;
        const barbershopId = user.barbershopId || user.workedBarbershopId;
        
        console.log("User Context:", { id: user.id, role: user.role, barbershopId });

        const start = new Date(new Date().setDate(1));
        const end = new Date();

        console.log("Fetching transactions and orders...");
        const [transactions, orders] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    barbershopId: barbershopId,
                    date: { gte: start, lte: end }
                },
                include: { professional: { select: { name: true } } }
            }),
            prisma.order.findMany({
                where: {
                    barbershopId: barbershopId,
                    status: { in: ['CLOSED', 'PAID'] },
                    updatedAt: { gte: start, lte: end }
                },
                include: { items: true, client: true }
            })
        ]);

        console.log("Counts:", { transactions: transactions.length, orders: orders.length });

        // KPIs
        const totalRevenue = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
        console.log("Total Revenue:", totalRevenue);

        // Ranking Pro
        const proStock = {};
        transactions.filter(t => t.type === 'INCOME' && t.professionalId).forEach(t => {
            const id = t.professionalId;
            if (!proStock[id]) proStock[id] = { name: t.professional?.name || 'Desconhecido', revenue: 0, commission: 0 };
            proStock[id].revenue += Number(t.amount);
        });

        console.log("Pro Ranking Calc started...");
        const rankingPro = Object.values(proStock).map(p => ({
            ...p,
            net: p.revenue - p.commission
        })).sort((a, b) => b.net - a.net);
        console.log("Pro Ranking Calc done.");

        console.log("TEST SUCCESSFUL!");
    } catch (err) {
        console.error("TEST FAILED:", err);
    } finally {
        await prisma.$disconnect();
    }
}

test();
