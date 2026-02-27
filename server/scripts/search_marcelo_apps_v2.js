
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        console.log('--- SEARCHING FOR ALL MARCELO APPOINTMENTS ---');

        const apps = await prisma.appointment.findMany({
            where: {
                client: {
                    name: { contains: 'Marcelo', mode: 'insensitive' }
                }
            },
            include: {
                client: true,
                barbershop: { select: { name: true } },
                service: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });

        console.log(`Found ${apps.length} appointments for "Marcelo":`);

        const userGroups = {};

        apps.forEach(a => {
            const key = `${a.client.name} (${a.client.phone}) [Client ID: ${a.clientId}] [Auth ID: ${a.client.authUserId || 'GUEST'}]`;
            if (!userGroups[key]) userGroups[key] = [];
            userGroups[key].push(a);
        });

        for (const [key, userApps] of Object.entries(userGroups)) {
            console.log(`\nProfile: ${key}`);
            userApps.forEach(a => {
                console.log(`  - [${a.status}] ${a.date.toISOString()} | Shop: ${a.barbershop.name} | Svc: ${a.service.name}`);
            });
        }
    } catch (e) {
        console.error('Error during search:', e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

debug();
