const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    const email = 'marcelogeusti@gmail.com';
    console.log(`Checking user: ${email}`);

    const authUser = await prisma.authUser.findUnique({
        where: { email },
        include: {
            user: {
                include: { ownedBarbershops: true, workedBarbershop: true }
            },
            client: true
        }
    });

    if (!authUser) {
        console.log('AuthUser NOT FOUND');
        return;
    }

    console.log('AuthUser found:', JSON.stringify({
        id: authUser.id,
        email: authUser.email,
        hasPassword: !!authUser.password
    }, null, 2));

    if (authUser.user) {
        console.log('User (Pro Profile) found:', JSON.stringify({
            id: authUser.user.id,
            role: authUser.user.role,
            ownedCount: authUser.user.ownedBarbershops.length
        }, null, 2));
    } else {
        console.log('User (Pro Profile) NOT FOUND');
    }

    if (authUser.client) {
        console.log('Client found:', JSON.stringify({
            id: authUser.client.id,
            name: authUser.client.name
        }, null, 2));
    } else {
        console.log('Client NOT FOUND');
    }
}

debug().catch(console.error).finally(() => prisma.$disconnect());
