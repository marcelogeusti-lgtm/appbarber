const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, endOfDay } = require('date-fns');

async function debugOwnerReport() {
    try {
        console.log('--- Testing Owner Report Logic ---');

        // Mock request data
        const barbershop = await prisma.barbershop.findFirst();
        if (!barbershop) {
            console.log('No barbershop found');
            return;
        }

        const barbershopId = barbershop.id;
        console.log(`Testing for Barbershop ID: ${barbershopId}`);

        const startDate = new Date(new Date().setDate(1));
        const endDate = new Date();

        let where = { barbershopId };

        const [transactions, orders] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    ...where,
                    date: { gte: startOfDay(startDate), lte: endOfDay(endDate) }
                },
                include: { professional: { select: { name: true } } }
            }),
            prisma.order.findMany({
                where: {
                    ...where,
                    status: { in: ['CLOSED', 'PAID'] },
                    updatedAt: { gte: startOfDay(startDate), lte: endOfDay(endDate) }
                },
                include: { items: true, client: true }
            })
        ]);

        console.log(`Found ${transactions.length} transactions and ${orders.length} orders.`);

        // Test basic math
        const totalRevenue = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
        console.log(`Total Revenue: ${totalRevenue}`);

        // Test Rankings
        const serviceStats = {};
        orders.forEach(o => {
            o.items.filter(i => i.type === 'SERVICE').forEach(i => {
                const name = i.description || 'Serviço';
                if (!serviceStats[name]) serviceStats[name] = { count: 0, revenue: 0 };
                serviceStats[name].count += i.quantity;
                serviceStats[name].revenue += Number(i.total);
            });
        });
        const topServices = Object.entries(serviceStats).map(([name, s]) => ({ name, ...s })).sort((a, b) => b.revenue - a.revenue);
        console.log(`Top Services: ${JSON.stringify(topServices.slice(0, 2))}`);

        // Test Alerts
        const prev7To14Days = await prisma.transaction.findMany({
            where: {
                ...where,
                type: 'INCOME',
                date: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 14)),
                    lte: new Date(new Date().setDate(new Date().getDate() - 7))
                }
            }
        });
        console.log(`Previous transactions: ${prev7To14Days.length}`);

        console.log('--- Logic Success ---');
    } catch (err) {
        console.error('--- LOGIC FAILED ---');
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

debugOwnerReport();
