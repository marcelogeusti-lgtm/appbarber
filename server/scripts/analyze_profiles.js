
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    try {
        console.log('--- DETAILED PROFILE ANALYSIS ---');

        // Profiles to check
        const names = ['Marcelo', 'Marcela'];

        const clients = await prisma.client.findMany({
            where: {
                OR: names.map(n => ({ name: { contains: n, mode: 'insensitive' } }))
            },
            include: {
                authUser: true,
                _count: { select: { appointments: true } }
            }
        });

        console.log(`Found ${clients.length} potential client profiles:`);
        for (const c of clients) {
            console.log(`- Name: ${c.name} | Phone: ${c.phone} | Auth: ${c.authUser?.email || 'GUEST'}`);
            console.log(`  ID: ${c.id} | Appointments: ${c._count.appointments}`);

            if (c._count.appointments > 0) {
                const shops = await prisma.appointment.findMany({
                    where: { clientId: c.id },
                    select: { barbershop: { select: { name: true } } },
                    distinct: ['barbershopId']
                });
                console.log(`  Shops: ${shops.map(s => s.barbershop.name).join(', ')}`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

debug();
