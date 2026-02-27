
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        const clientId = '9e464e88-b1d5-4bad-8a4c-793838904ead';
        console.log(`--- CHECKING BARBERSHOP RELATIONS ---`);

        const apps = await prisma.appointment.findMany({
            where: { clientId },
            select: {
                id: true,
                barbershopId: true,
                barbershop: { select: { id: true, name: true } },
                date: true
            },
            orderBy: { date: 'desc' }
        });

        apps.forEach((a, i) => {
            if (!a.barbershop) {
                console.log(`[ALERT] App ${a.id} has NO barbershop relation! (barbershopId: ${a.barbershopId})`);
            } else if (a.barbershop.name.toLowerCase().includes('corte')) {
                console.log(`- App ${a.id} | Shop: ${a.barbershop.name} | ID: ${a.barbershop.id}`);
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
