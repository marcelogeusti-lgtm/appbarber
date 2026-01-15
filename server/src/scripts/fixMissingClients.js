const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Fixing Missing Clients ---');

    // 1. Get all Client IDs
    const clients = await prisma.client.findMany({ select: { id: true } });
    const clientIds = new Set(clients.map(c => c.id));

    // 2. Get all distinct clientIds from Appointments
    const appointments = await prisma.appointment.findMany({
        distinct: ['clientId'],
        select: { clientId: true }
    });

    console.log(`Checking ${appointments.length} distinct appointment client IDs against ${clientIds.size} existing clients.`);

    for (const app of appointments) {
        if (!clientIds.has(app.clientId)) {
            console.log(`Missing Client for ID: ${app.clientId}`);

            // Checks if this ID belongs to a User (Pro)
            const user = await prisma.user.findUnique({ where: { id: app.clientId } });

            if (user) {
                console.log(`  > Found in User table (${user.role}). Creating Client profile...`);

                // Determine AuthUserId
                // If user is linked to AuthUser, use it.
                // But wait, 'User.authUserId' might not be populated if migration failed or it's a new user.
                // We'll try to find or create AuthUser.

                let authUserId = user.authUserId;
                if (!authUserId) {
                    // Try find by email
                    const userEmail = user.email || `noemail_${user.id}@barbeom.com`;
                    const auth = await prisma.authUser.findUnique({ where: { email: userEmail } });
                    if (auth) authUserId = auth.id;
                    else {
                        // Create AuthUser if missing (Edge case)
                        const newAuth = await prisma.authUser.create({
                            data: { email: userEmail, provider: 'EMAIL' }
                        });
                        authUserId = newAuth.id;
                    }
                }

                // Create Client
                try {
                    await prisma.client.create({
                        data: {
                            id: user.id, // Preserve ID
                            name: user.name,
                            phone: user.phone,
                            authUserId: authUserId, // Link to same AuthUser
                            avatarUrl: user.avatarUrl
                        }
                    });
                    console.log('  > Created missing Client record.');
                } catch (e) {
                    console.error('  ! Failed to create client:', e.message);
                }
            } else {
                console.warn(`  ! ID ${app.clientId} not found in User table either. Orphaned Appointment.`);
                // Optional: Delete appointment?
                // await prisma.appointment.deleteMany({ where: { clientId: app.clientId } });
            }
        }
    }
    console.log('--- Fix Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
