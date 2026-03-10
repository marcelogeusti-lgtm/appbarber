const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmins() {
    console.log('--- CHECKING ADMINS ---');
    const admins = await prisma.user.findMany({
        where: { role: 'SUPER_ADMIN' },
        select: { name: true, email: true, role: true }
    });
    console.log(JSON.stringify(admins, null, 2));
}

checkAdmins().finally(() => prisma.$disconnect());
