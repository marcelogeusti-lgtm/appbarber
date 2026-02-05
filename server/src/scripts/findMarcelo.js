const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUser() {
    const user = await prisma.user.findFirst({
        where: { email: 'marcelogeusti@gmail.com' },
        select: { workedBarbershopId: true, name: true }
    });
    console.log('USER_INFO:', JSON.stringify(user));
    await prisma.$disconnect();
}

findUser();
