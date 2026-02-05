const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listFlags() {
    try {
        const flags = await prisma.featureFlag.findMany({
            include: { barbershop: { select: { name: true } } }
        });
        console.log('ALL_FLAGS:', JSON.stringify(flags, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listFlags();
