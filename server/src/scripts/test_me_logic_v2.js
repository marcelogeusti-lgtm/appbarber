const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetMyAppointments() {
    try {
        const authUserId = '8a539e51-72f5-44ea-8416-da107fadf8a3'; // Marcelo's authUID
        const userId = '9e464e88-b1d5-4bad-8a4c-793838904ead';    // Marcelo's current clientID

        console.log(`Testing for authUserId: ${authUserId}, userId: ${userId}`);

        let clientIds = [userId];

        if (authUserId) {
            const allProfiles = await prisma.client.findMany({
                where: { authUserId },
                select: { id: true }
            });
            console.log(`Found ${allProfiles.length} profiles for authUserId: ${authUserId}`);
            clientIds = allProfiles.map(p => p.id);
        }

        console.log(`Effective clientIds to search: ${JSON.stringify(clientIds)}`);

        // As Client
        const bookings = await prisma.appointment.findMany({
            where: { clientId: { in: clientIds } },
            include: { professional: { select: { name: true } }, service: true, barbershop: true },
            orderBy: { date: 'desc' }
        });

        console.log(`Total bookings found: ${bookings.length}`);
        if (bookings.length > 0) {
            console.log(`Latest booking: ID: ${bookings[0].id} | Date: ${bookings[0].date} | Shop: ${bookings[0].barbershop?.name} | Status: ${bookings[0].status}`);
        }

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testGetMyAppointments();
