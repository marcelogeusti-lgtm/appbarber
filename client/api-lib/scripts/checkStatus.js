const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const clientCount = await prisma.client.count();
        const authUserCount = await prisma.authUser.count();
        const barbershopCount = await prisma.barbershop.count();

        console.log('--- Database Status ---');
        console.log('Users:', userCount);
        console.log('Clients:', clientCount);
        console.log('AuthUsers:', authUserCount);
        console.log('Barbershops:', barbershopCount);

        if (userCount > 0) {
            const masters = await prisma.user.findMany({
                where: { role: 'SUPER_ADMIN' },
                select: { id: true, name: true, email: true }
            });
            console.log('Master Accounts:', masters);
        }
    } catch (error) {
        console.error('Error checking DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
