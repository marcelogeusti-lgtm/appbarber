const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser(email) {
    try {
        const u = await prisma.user.findFirst({
            where: { email }
        });
        console.log('--- USER ROLE ---');
        console.log('Name:', u.name);
        console.log('Role:', u.role);
        console.log('isMaster:', u.isMaster);
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser('marcelogeusti@gmail.com');
