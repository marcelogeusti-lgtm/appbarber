const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
    const r = await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
    console.log(r);
}
check().finally(() => prisma.$disconnect());
