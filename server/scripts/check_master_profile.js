const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'marcelogeusti@gmail.com' },
            include: { professional: true }
        });
        console.log('--- USER DATA ---');
        console.log(JSON.stringify(user, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
