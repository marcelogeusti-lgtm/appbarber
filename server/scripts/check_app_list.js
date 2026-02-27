
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        const clientId = '9e464e88-b1d5-4bad-8a4c-793838904ead';
        console.log(`--- ANALYZING APPOINTMENT ORDER FOR CLIENT ${clientId} ---`);

        const apps = await prisma.appointment.findMany({
            where: { clientId },
            include: { barbershop: { select: { name: true } } },
            orderBy: { date: 'desc' }
        });

        console.log(`Total: ${apps.length}`);
        apps.forEach((a, i) => {
            console.log(`${i + 1}. [${a.status}] ${a.date.toISOString()} | ${a.barbershop.name}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

debug();
