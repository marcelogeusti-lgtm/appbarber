
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    const email = 'marcelogeusti@gmail.com';
    console.log(`--- SIMULATING GET /appointments/me FOR ${email} ---`);

    // 1. Find Client for this email
    const client = await prisma.client.findFirst({
        where: { authUser: { email } }
    });

    if (!client) {
        console.log('Client not found.');
        process.exit(1);
    }

    const userId = client.id;
    console.log(`Using Client ID: ${userId}`);

    // 2. Simulate Controller Logic
    try {
        const bookings = await prisma.appointment.findMany({
            where: { clientId: userId },
            include: { professional: { select: { name: true } }, service: true, barbershop: true },
            orderBy: { date: 'desc' }
        });

        console.log(`\nAPI would return ${bookings.length} appointments:`);
        bookings.forEach(a => {
            console.log(`- [${a.status}] ${a.date.toISOString()} | Shop: ${a.barbershop?.name} | Svc: ${a.service?.name}`);
        });

    } catch (error) {
        console.error('Error in controller simulation:', error);
    }

    process.exit(0);
}

debug().catch(e => {
    console.error(e);
    process.exit(1);
});
