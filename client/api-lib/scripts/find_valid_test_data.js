const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shops = await prisma.barbershop.findMany({
            include: {
                services: { where: { active: true } },
                staff: true
            }
        });

        const validShop = shops.find(s => s.services.length > 0 && s.staff.length > 0);

        if (validShop) {
            console.log('--- VALID SHOP FOUND ---');
            console.log(`SHOP_ID: ${validShop.id}`);
            console.log(`SHOP_NAME: ${validShop.name}`);
            console.log(`PRO_ID: ${validShop.staff[0].id}`);
            console.log(`SERVICE_ID: ${validShop.services[0].id}`);
            console.log(`SERVICE_NAME: ${validShop.services[0].name}`);
        } else {
            console.log('No valid shop with services and staff found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
