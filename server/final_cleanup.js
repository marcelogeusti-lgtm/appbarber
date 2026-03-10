const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function finalCleanup() {
    const emails = [
        'test_multi_role_1772065291398@example.com',
        'test_multi_role_1772066694443@example.com',
        'test_multi_role_1772066732953@example.com',
        'cgeusti@gmail.com',
        'jgeusti@gmail.com',
        'danielnevves28@gmail.com'
    ];

    console.log('--- STARTING FINAL OWNER CLEANUP ---');

    for (const email of emails) {
        console.log(`Processing ${email}...`);
        const user = await prisma.user.findUnique({
            where: { email },
            include: { authUser: true }
        });

        if (!user) {
            console.log(`  User with email ${email} not found. Skipping.`);
            continue;
        }

        if (user.role === 'SUPER_ADMIN') {
            console.log(`  CRITICAL: Skipping deletion of SUPER_ADMIN ${email}`);
            continue;
        }

        try {
            const authUserId = user.authUserId;

            // Cleanup profile dependencies
            await prisma.professional.deleteMany({ where: { userId: user.id } });
            await prisma.notification.deleteMany({ where: { OR: [{ userId: user.id }, { clientId: user.id }] } });

            if (authUserId) {
                await prisma.client.deleteMany({ where: { authUserId } });
                await prisma.pushSubscription.deleteMany({ where: { userId: user.id } });
                await prisma.fcmToken.deleteMany({ where: { authUserId } });
                await prisma.session.deleteMany({ where: { authUserId } });
                await prisma.user.delete({ where: { id: user.id } });
                await prisma.authUser.delete({ where: { id: authUserId } });
                console.log(`  User ${email} and AuthUser ${authUserId} deleted.`);
            } else {
                await prisma.user.delete({ where: { id: user.id } });
                console.log(`  User record ${email} deleted.`);
            }
        } catch (err) {
            console.error(`  Error deleting ${email}:`, err.message);
        }
    }

    console.log('--- FINAL CLEANUP COMPLETE ---');
}

finalCleanup().finally(() => prisma.$disconnect());
