const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const shops = await prisma.barbershop.findMany();
        console.log('--- ALL SHOPS ---');
        console.log(JSON.stringify(shops, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
