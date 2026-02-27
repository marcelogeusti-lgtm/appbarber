
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        const clientId = '9e464e88-b1d5-4bad-8a4c-793838904ead';
        const now = new Date(); // Replicate frontend 'now'

        console.log(`--- FRONTEND LOGIC SIMULATION ---`);
        console.log(`Now: ${now.toISOString()} (${now.toString()})`);

        const apps = await prisma.appointment.findMany({
            where: { clientId },
            include: { barbershop: { select: { name: true } } },
            orderBy: { date: 'desc' }
        });

        apps.forEach((a, i) => {
            const appDate = new Date(a.date);
            const isFuture = appDate >= now;
            const isScheduled = (a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'SCHEDULED') && isFuture;

            if (a.barbershop.name.toLowerCase().includes('corte')) {
                console.log(`\nApp ID: ${a.id}`);
                console.log(`Date in DB: ${a.date}`);
                console.log(`Date Obj: ${appDate.toISOString()}`);
                console.log(`Is Future? ${isFuture}`);
                console.log(`Would show in 'Scheduled'? ${isScheduled}`);
                console.log(`Status: ${a.status}`);
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
