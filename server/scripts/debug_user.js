const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectUser() {
    const email = 'waniely2357@gmail.com';
    console.log(`Inspecting user: ${email}`);

    try {
        const authUser = await prisma.authUser.findUnique({
            where: { email },
            include: {
                user: {
                    include: {
                        ownedBarbershops: true
                    }
                }
            }
        });

        if (!authUser) {
            console.log('User not found in AuthUser.');
            return;
        }

        console.log('AuthUser found:', authUser.id);

        if (authUser.user) {
            console.log('User profile found:', authUser.user.id);
            console.log('Role:', authUser.user.role);

            if (authUser.user.ownedBarbershops.length > 0) {
                console.log('Owned Barbershops:', authUser.user.ownedBarbershops.map(b => ({
                    id: b.id,
                    name: b.name,
                    status: b.subscriptionStatus,
                    trialEndsAt: b.trialEndsAt
                })));
            } else {
                console.log('No owned barbershops found.');
            }
        } else {
            console.log('No User profile linked (maybe Client only?).');
        }

    } catch (error) {
        console.error('Error inspecting:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectUser();
