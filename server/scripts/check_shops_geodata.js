const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkShops() {
    try {
        const shops = await prisma.barbershop.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                address: true,
                latitude: true,
                longitude: true,
                subscriptionStatus: true
            }
        });
        console.log(JSON.stringify(shops, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkShops();
