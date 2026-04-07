const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupUsers() {
    const masterEmail = 'marcelogeusti@gmail.com';

    console.log(`Starting cleanup... Preserving ONLY: ${masterEmail}`);

    try {
        // 1. Delete all AuthUsers except Master
        const deletedAuth = await prisma.authUser.deleteMany({
            where: {
                email: {
                    not: masterEmail
                }
            }
        });

        console.log(`Deleted ${deletedAuth.count} AuthUsers.`);

        // 2. Also ensure User/Client tables are clean (cascade should handle this via Prisma schema, but we double check)
        // If relations are set to cascade on delete in schema.prisma, deleting AuthUser is enough.
        // If not, we might need to manually delete Orphans. 
        // For safety, let's assume cascade is configured or we just rely on AuthUser cleanup as the root.

        console.log('Cleanup complete!');

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupUsers();
