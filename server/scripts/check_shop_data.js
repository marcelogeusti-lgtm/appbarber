const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const shop = await prisma.barbershop.findFirst({
            where: { name: { contains: 'Waniely', mode: 'insensitive' } }
        });
        console.log('--- SHOP DATA ---');
        console.log(JSON.stringify(shop, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
