const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugBarbers() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const accounts = await prisma.user.findMany({
        where: {
            role: 'BARBER',
            workedBarbershop: {
                slug: 'next'
            }
        },
        select: {
            id: true,
            name: true
        }
    });

    for (const acc of accounts) {
        const apptCount = await prisma.appointment.count({
            where: {
                professionalId: acc.id,
                createdAt: { gte: today }
            }
        });
        
        const txCount = await prisma.transaction.count({
            where: {
                professionalId: acc.id,
                createdAt: { gte: today }
            }
        });

        console.log(`[${acc.name}] Appointments today: ${apptCount}, Transactions today: ${txCount}`);
    }
}

debugBarbers().catch(console.error).finally(() => prisma.$disconnect());
