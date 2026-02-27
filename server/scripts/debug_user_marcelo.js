
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    const email = 'marcelogeusti@gmail.com'; // Based on common user in this workspace
    console.log(`--- DEBUGGING FOR EMAIL: ${email} ---`);

    // 1. Find AuthUser
    const authUser = await prisma.authUser.findUnique({
        where: { email },
        include: { client: true, user: true }
    });

    if (!authUser) {
        console.log('No AuthUser found for this email.');
        // Try searching for client by name
        const clients = await prisma.client.findMany({
            where: { name: { contains: 'Marcelo', mode: 'insensitive' } },
            include: { authUser: true }
        });
        console.log(`Found ${clients.length} clients with name Marcelo:`);
        clients.forEach(c => console.log(`- ID: ${c.id} | Email: ${c.authUser?.email} | Phone: ${c.phone}`));
    } else {
        console.log(`AuthUser ID: ${authUser.id}`);
        console.log(`Linked Client ID: ${authUser.client?.id || 'NONE'}`);
        console.log(`Linked User ID: ${authUser.user?.id || 'NONE'}`);

        if (authUser.client) {
            const apps = await prisma.appointment.findMany({
                where: { clientId: authUser.client.id },
                include: { barbershop: { select: { name: true } }, service: { select: { name: true } } }
            });
            console.log(`\nAppointments for Client ID ${authUser.client.id}: ${apps.length}`);
            apps.forEach(a => console.log(`- ${a.date} | ${a.barbershop.name} | ${a.service.name} | Status: ${a.status}`));
        }

        // Search for other clients with the same name or phone as the AuthUser/User
        const otherClients = await prisma.client.findMany({
            where: {
                OR: [
                    { name: { contains: authUser.user?.name || 'Marcelo', mode: 'insensitive' } },
                    { phone: authUser.user?.phone || 'nonexistent' }
                ],
                NOT: { id: authUser.client?.id || 'none' }
            }
        });

        console.log(`\nOther potential client profiles for this user: ${otherClients.length}`);
        for (const oc of otherClients) {
            const apps = await prisma.appointment.count({ where: { clientId: oc.id } });
            console.log(`- ID: ${oc.id} | Name: ${oc.name} | Phone: ${oc.phone} | Appointments: ${apps}`);
        }
    }

    process.exit(0);
}

debug().catch(e => {
    console.error(e);
    process.exit(1);
});
