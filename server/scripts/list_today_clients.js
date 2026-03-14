const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listTodayClients() {
    try {
        console.log('--- Clients created on 14/03/2026 ---');
        const today = new Date('2026-03-14T00:00:00Z');
        const tomorrow = new Date('2026-03-15T00:00:00Z');

        const clients = await prisma.client.findMany({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                createdAt: true,
                _count: {
                    select: { appointments: true, orders: true }
                }
            }
        });

        clients.forEach(c => {
            console.log(`Client: ${c.name} | Phone: ${c.phone} | Created: ${c.createdAt} | Apps: ${c._count.appointments} | Orders: ${c._count.orders}`);
        });

        console.log(`Total: ${clients.length}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listTodayClients();
