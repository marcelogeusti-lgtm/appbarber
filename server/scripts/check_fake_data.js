const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecent() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const barbershops = await prisma.barbershop.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
        }
    });

    console.log("Checking appointments from today onwards...");
    for (const shop of barbershops) {
        const apptCount = await prisma.appointment.count({
            where: {
                barbershopId: shop.id,
                createdAt: { gte: today }
            }
        });

        const txCount = await prisma.transaction.count({
            where: {
                barbershopId: shop.id,
                createdAt: { gte: today }
            }
        });

        if (apptCount > 0 || txCount > 0) {
            console.log(`[${shop.name} - ${shop.slug}] Appointments created today: ${apptCount}, Transactions created today: ${txCount}`);
        }
    }

    console.log("Checking appointments scheduled in the future...");
    for (const shop of barbershops) {
        const futureCount = await prisma.appointment.count({
            where: {
                barbershopId: shop.id,
                date: { gt: new Date() }
            }
        });
        if (futureCount > 0) {
            console.log(`[${shop.name} - ${shop.slug}] Scheduled in future: ${futureCount}`);
        }
    }
}

checkRecent().catch(console.error).finally(() => prisma.$disconnect());
