
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        const clientId = '9e464e88-b1d5-4bad-8a4c-793838904ead';
        console.log(`--- FULL API SIMULATION: GET /appointments/me ---`);

        // Exact logic from controller
        const appointments = await prisma.appointment.findMany({
            where: { clientId },
            include: {
                professional: { select: { name: true } },
                service: true,
                barbershop: true
            },
            orderBy: { date: 'desc' }
        });

        console.log(`Count: ${appointments.length}`);

        const shopsEncountered = new Set();
        appointments.forEach(a => {
            if (a.barbershop) shopsEncountered.add(a.barbershop.name);
        });

        console.log('Shops in response:', Array.from(shopsEncountered));

        const corteApps = appointments.filter(a => a.barbershop?.name.toLowerCase().includes('corte'));
        console.log(`'Corte' apps in JSON: ${corteApps.length}`);

        if (corteApps.length > 0) {
            console.log('Sample Corte App:', JSON.stringify(corteApps[0], null, 2));
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

debug();
