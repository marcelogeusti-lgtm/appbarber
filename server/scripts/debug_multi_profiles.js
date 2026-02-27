
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    console.log('--- DEBUGGING MULTI-PROFILE USERS ---');

    // Find AuthUsers that have BOTH Client and User
    const multiProfiles = await prisma.authUser.findMany({
        where: {
            NOT: {
                client: null,
                user: null
            }
        },
        include: {
            client: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, role: true } }
        }
    });

    console.log(`\nUsers with both Pro and Client profiles: ${multiProfiles.length}`);

    for (const auth of multiProfiles) {
        const clientApps = await prisma.appointment.count({ where: { clientId: auth.client.id } });
        const proApps = await prisma.appointment.count({ where: { professionalId: auth.user.id } });

        console.log(`- Auth: ${auth.email}`);
        console.log(`  - Client ID: ${auth.client.id} | Appointments: ${clientApps}`);
        console.log(`  - User ID: ${auth.user.id} (${auth.user.role}) | Pro Appointments: ${proApps}`);

        if (clientApps > 0) {
            console.log(`  [!] This user HAS client appointments but might be logged as ${auth.user.role}`);
        }
    }

    process.exit(0);
}

debug().catch(e => {
    console.error(e);
    process.exit(1);
});
