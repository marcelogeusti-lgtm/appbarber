const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMaster() {
    try {
        const master = await prisma.user.findUnique({
            where: { email: 'marcelogeusti@gmail.com' },
            include: {
                ownedBarbershops: true,
                workedBarbershop: true
            }
        });
        console.log('--- MASTER USER AUDIT ---');
        console.log(JSON.stringify(master, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkMaster();
