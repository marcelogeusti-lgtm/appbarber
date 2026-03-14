const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const shops = await prisma.barbershop.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                ownerId: true,
                createdAt: true
            }
        });
        console.log(JSON.stringify(shops, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
