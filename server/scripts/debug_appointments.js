
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    console.log('--- DEBUGGING APPOINTMENTS ---');

    // 1. List last 10 appointments
    const appointments = await prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { client: true, barbershop: { select: { name: true } } }
    });

    console.log('\nLast 10 Appointments:');
    appointments.forEach(a => {
        console.log(`- ID: ${a.id} | Date: ${a.date} | Client: ${a.client?.name} (ID: ${a.clientId}) | Shop: ${a.barbershop?.name}`);
    });

    // 2. Check for Clients without AuthUser vs with AuthUser
    const clientsWithAuth = await prisma.client.count({ where: { NOT: { authUserId: null } } });
    const clientsWithoutAuth = await prisma.client.count({ where: { authUserId: null } });

    console.log(`\nClients with Auth: ${clientsWithAuth}`);
    console.log(`Clients without Auth (Guests): ${clientsWithoutAuth}`);

    // 3. Look for potential duplicates (same phone or name)
    const duplicates = await prisma.$queryRaw`
        SELECT name, phone, COUNT(*) 
        FROM "Client" 
        GROUP BY name, phone 
        HAVING COUNT(*) > 1
    `;
    console.log('\nPotential Duplicates (Same Name & Phone):', duplicates);

    // 4. Check for appointments linked to AuthUsers directly (mistake) or Users
    const appCount = await prisma.appointment.count();
    console.log(`\nTotal Appointments: ${appCount}`);

    process.exit(0);
}

debug().catch(e => {
    console.error(e);
    process.exit(1);
});
