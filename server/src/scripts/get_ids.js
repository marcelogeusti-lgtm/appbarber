const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shop = await prisma.barbershop.findFirst({
            include: {
                services: { where: { active: true } },
                staff: true
            }
        });

        if (shop) {
            console.log('--- DATA FOUND ---');
            console.log(`SHOP_ID: ${shop.id}`);
            console.log(`SHOP_NAME: ${shop.name}`);
            if (shop.staff.length > 0) {
                console.log(`PRO_ID: ${shop.staff[0].id}`);
                console.log(`PRO_NAME: ${shop.staff[0].name}`);
            }
            if (shop.services.length > 0) {
                console.log(`SERVICE_ID: ${shop.services[0].id}`);
                console.log(`SERVICE_NAME: ${shop.services[0].name}`);
            }
        } else {
            console.log('No shop found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
