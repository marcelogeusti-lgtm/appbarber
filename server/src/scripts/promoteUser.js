const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function promoteUser() {
    try {
        const user = await prisma.user.update({
            where: { email: 'marcelogeusti@gmail.com' },
            data: { role: 'SUPER_ADMIN' }
        });
        console.log('SUCCESS: User promoted to SUPER_ADMIN:', JSON.stringify(user));
    } catch (e) {
        console.error('ERROR promoting user:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

promoteUser();
