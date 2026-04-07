const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'marcelogeusti@gmail.com' }
        });
        console.log('USER_DATA:', JSON.stringify(user));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
