const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const logs = await prisma.emailLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log(logs);
}
check().finally(() => prisma.$disconnect());
