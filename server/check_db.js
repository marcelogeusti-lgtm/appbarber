const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const user = await prisma.authUser.findUnique({
        where: { email: 'marcelogeusti@gmail.com' }
    });
    console.log('User 2FA Status:', user ? user.twoFactorEnabled : 'User Not Found');
}
checkUser().finally(() => prisma.$disconnect());
