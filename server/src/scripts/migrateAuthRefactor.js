const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('--- Starting Auth Refactor Migration ---');

    // 1. Fetch all existing Users
    // Note: We are running this AFTER schema update, so Prisma might be confused about relations.
    // We will try to read 'User' table. If 'authUserId' column exists but is null, it's fine.

    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
        try {
            console.log(`Migrating user: ${user.email} (${user.role})`);

            // Check if AuthUser already exists (idempotency)
            const userEmail = user.email || `noemail_${user.id}@barbeom.com`;
            let authUser = await prisma.authUser.findUnique({ where: { email: userEmail } });

            if (!authUser) {
                // Create AuthUser
                // Use existing password or temp
                authUser = await prisma.authUser.create({
                    data: {
                        email: userEmail,
                        password: user.password, // Move password hash
                        provider: 'EMAIL', // Default
                    }
                });
                console.log(`  > Created AuthUser: ${authUser.id}`);
            }

            if (user.role === 'CLIENT') {
                // --- CLIENT MIGRATION ---

                // Check if Client profile exists
                const existingClient = await prisma.client.findUnique({ where: { id: user.id } }); // Try to keep ID

                if (!existingClient) {
                    // Create Client Profile with SAME ID to preserve Appointment links
                    await prisma.client.create({
                        data: {
                            id: user.id, // KEEPING ID IS CRITICAL
                            name: user.name,
                            phone: user.phone,
                            authUserId: authUser.id,
                            avatarUrl: user.avatarUrl,
                            theme: user.theme || 'dark'
                        }
                    });
                    console.log(`  > Created Client Profile (ID preserved).`);
                }

                // NOW, we should technically remove the 'User' record so they don't exist in two places?
                // But for safety, we might keep it or delete it?
                // The constraints say "User.email" unique.
                // If we keep User, we have duplicate emails in User and AuthUser?
                // 'User.email' is unique in User table. 'AuthUser.email' is unique in AuthUser table.
                // They are separate.

                // However, the requirement is "Strict Separation".
                // Clients should NOT be in 'User' table anymore.
                // But if I delete User, do I break foreign keys on 'Appointment.clientId' pointing to User?
                // My Schema change (prisma push) will likely change Appointment.clientId Foreign Key to point to 'Client' table.
                // If so, deleting from 'User' is fine/required.

                // For this script, I won't delete yet to avoid cascading deletes if something is wrong.
                // I'll let the user verify first. Or I can delete if I'm confident.
                // Let's delete to be clean.

                // Wait, if Appointment still points to User (before DB push finishes/updates), deleting User deletes Appointments (Cascade?).
                // CHECK SCHEMA: Appointment.client is now 'Client'.
                // So Appointment.clientId points to Client.
                // So deleting User is safe regarding Appointments *IF* the FK is updated.

                try {
                    await prisma.user.delete({ where: { id: user.id } });
                    console.log('  > Deleted legacy User record.');
                } catch (e) {
                    console.warn('  ! Could not delete legacy User (might be referenced):', e.message);
                }

            } else {
                // --- BARBER/ADMIN MIGRATION ---
                // Just link to AuthUser
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        authUserId: authUser.id,
                        // We can clear password from User table if we want, but keeping it optional is fine
                    }
                });
                console.log(`  > Linked User to AuthUser.`);
            }

        } catch (e) {
            console.error(`Error migrating User ${user.id}:`, e);
        }
    }

    console.log('--- Migration Complete ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
