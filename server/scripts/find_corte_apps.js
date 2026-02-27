
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        const clientId = '9e464e88-b1d5-4bad-8a4c-793838904ead';
        console.log(`--- FILTERING FOR 'CORTE CONEXÃO' ---`);

        const apps = await prisma.appointment.findMany({
            where: { clientId },
            include: { barbershop: { select: { name: true } } },
            orderBy: { date: 'desc' }
        });

        apps.forEach((a, i) => {
            if (a.barbershop.name.toLowerCase().includes('corte')) {
                console.log(`${i + 1}. [${a.status}] ${a.date.toISOString()} | ${a.barbershop.name}`);
            }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

debug();
