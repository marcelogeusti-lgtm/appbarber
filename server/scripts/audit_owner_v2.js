const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const ownerId = '47475ddb-a924-4736-b432-5e004519b809';
        const user = await prisma.user.findUnique({
            where: { id: ownerId }
        });
        console.log('--- OWNER USER DATA ---');
        console.log(JSON.stringify(user, null, 2));

        const authUser = await prisma.authUser.findFirst({
            where: {
                user: { id: ownerId }
            }
        });
        console.log('--- OWNER AUTH DATA ---');
        console.log(JSON.stringify(authUser, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
