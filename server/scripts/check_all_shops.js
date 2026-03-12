const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllShops() {
    const shops = await prisma.barbershop.findMany({
        include: {
            owner: true
        }
    });

    for (const shop of shops) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appts = await prisma.appointment.count({
            where: { barbershopId: shop.id, createdAt: { gte: today } }
        });
        const apptsForToday = await prisma.appointment.count({
            where: { barbershopId: shop.id, date: { gte: today } }
        });

        const txs = await prisma.transaction.count({
            where: { barbershopId: shop.id, createdAt: { gte: today } }
        });

        const sumTx = await prisma.transaction.aggregate({
             where: { barbershopId: shop.id, type: 'INCOME' },
             _sum: { amount: true }
        });

        // if this shop has 1280 revenue or generated data today
        if (appts > 0 || txs > 0 || (sumTx._sum.amount && sumTx._sum.amount == 1280)) {
            console.log(`[${shop.name} - ${shop.slug}] Owner: ${shop.owner?.name}. Appts generated today: ${appts}, Txs: ${txs}, Total Income: ${sumTx._sum.amount}, Appts for today: ${apptsForToday}`);
        }

        // Just checking owner name
        if (shop.owner?.name?.toLowerCase().includes('hier')) {
            console.log(`\nFound target shop by owner: ${shop.name} (${shop.owner.name})`);
        }
    }
}

checkAllShops().catch(console.error).finally(() => prisma.$disconnect());
