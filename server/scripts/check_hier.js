const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHier() {
    const hierUsers = await prisma.user.findMany({
        where: { name: { contains: 'Hier' } },
        include: {
            ownedBarbershops: true,
            workedBarbershop: true,
        }
    });

    console.log("Found Hier Users:", hierUsers.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        owned: u.ownedBarbershops.map(s => s.name),
        worked: u.workedBarbershop?.name
    })));

    for (const u of hierUsers) {
        if (u.ownedBarbershops.length > 0) {
            for (const shop of u.ownedBarbershops) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const appts = await prisma.appointment.count({
                    where: { barbershopId: shop.id, createdAt: { gte: today } }
                });
                const txs = await prisma.transaction.count({
                    where: { barbershopId: shop.id, createdAt: { gte: today } }
                });
                console.log(`[${shop.name}] Appts generated today: ${appts}, Txs: ${txs}`);
               
                const totalApptsTodayDate = await prisma.appointment.count({
                    where: { barbershopId: shop.id, date: { gte: today } }
                });
                console.log(`[${shop.name}] Total Appts scheduled today (date): ${totalApptsTodayDate}`);

                const sumTx = await prisma.transaction.aggregate({
                     where: { barbershopId: shop.id, date: { gte: today }, type: 'INCOME' },
                     _sum: { amount: true }
                });
                console.log(`[${shop.name}] Total Income today: ${sumTx._sum.amount}`);
            }
        }
    }
}

checkHier().catch(console.error).finally(() => prisma.$disconnect());
