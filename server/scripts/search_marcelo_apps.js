
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    console.log('--- SEARCHING FOR ALL MARCELO APPOINTMENTS ---');

    const apps = await prisma.appointment.findMany({
        where: {
            OR: [
                { client: { name: { contains: 'Marcelo', mode: 'insensitive' } } },
                { client: { name: { contains: 'Geusti', mode: 'insensitive' } } }
            ]
        },
        include: {
            client: true,
            barbershop: { select: { name: true } },
            service: { select: { name: true } }
        },
        orderBy: { date: 'desc' }
    });

    console.log(`Found ${apps.length} appointments for "Marcelo/Geusti":`);

    const userGroups = {};

    apps.forEach(a => {
        const key = `${a.client.name} (${a.client.phone}) [ID: ${a.clientId}]`;
        if (!userGroups[key]) userGroups[key] = [];
        userGroups[key].push(a);
    });

    for (const [key, userApps] of Object.entries(userGroups)) {
        console.log(`\nProfile: ${key}`);
        userApps.forEach(a => {
            console.log(`  - [${a.status}] ${a.date.toISOString()} | Shop: ${a.barbershop.name} | Svc: ${a.service.name}`);
        });
    }

    process.exit(0);
}

debug().catch(e => {
    console.error(e);
    process.exit(1);
});
