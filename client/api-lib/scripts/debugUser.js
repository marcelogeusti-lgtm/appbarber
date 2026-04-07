const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const email = 'marcelogeusti@gmail.com';
        console.log(`Checking user: ${email}`);

        const authUser = await prisma.authUser.findUnique({
            where: { email },
            include: {
                user: {
                    include: { ownedBarbershops: true }
                },
                client: true
            }
        });

        if (!authUser) {
            console.log('AuthUser NOT FOUND');
            return;
        }

        console.log('AuthUser Found:', JSON.stringify(authUser, null, 2));

        if (!authUser.user) {
            console.log('WARNING: AuthUser found but NO linked User (Professional) found.');
        }

    } catch (err) {
        console.error('ERROR during check:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
