const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shops = await prisma.barbershop.findMany({
            take: 1,
            include: {
                services: true,
                staff: true
            }
        });

        if (shops.length > 0) {
            const shop = shops[0];
            console.log(`--- SHOP: ${shop.name} (${shop.id}) ---`);
            console.log('SERVICES:');
            shop.services.forEach(s => console.log(`  - ${s.name} (${s.id}) [Active: ${s.active}]`));
            console.log('STAFF:');
            shop.staff.forEach(p => console.log(`  - ${p.name} (${p.id}) [Role: ${p.role}]`));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
