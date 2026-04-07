const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApi(authUserId) {
    try {
        console.log(`--- SIMULATING GET /appointments/me FOR authUserId: ${authUserId} ---`);

        // 1. Find all client profiles
        const allProfiles = await prisma.client.findMany({
            where: { authUserId },
            select: { id: true, name: true }
        });
        const clientIds = allProfiles.map(p => p.id);
        console.log(`Found ClientProfiles (${allProfiles.length}):`, allProfiles);

        // 2. Fetch appointments
        const bookings = await prisma.appointment.findMany({
            where: { clientId: { in: clientIds } },
            include: {
                professional: { select: { name: true } },
                service: { select: { name: true } },
                barbershop: { select: { name: true, id: true } }
            },
            orderBy: { date: 'desc' }
        });

        console.log(`TOTAL_BOOKINGS_FOUND: ${bookings.length}`);

        if (bookings.length > 0) {
            console.log('\nSample Booking:');
            const b = bookings[0];
            console.log(`ID: ${b.id} | Date: ${b.date.toISOString()} | Shop: ${b.barbershop?.name} | Service: ${b.service?.name}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

// Using Marcelo's authUserId found in diagnostics
testApi('8a539e51-72f5-44ea-8416-da107fadf8a3');
