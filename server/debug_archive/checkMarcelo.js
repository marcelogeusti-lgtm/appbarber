const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const user = await prisma.user.findFirst({
        where: { email: 'marcelogeusti@gmail.com' },
        include: { professionalProfile: true }
    });
    console.log('Marcelo User record:', JSON.stringify(user, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
