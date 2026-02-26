const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shopId = '7d97f2b1-ea87-4e2d-b838-dc7eff37b8ca'; // Rafa corte
        console.log(`--- Checking Shop: ${shopId} (Rafa corte) ---`);

        const shop = await prisma.barbershop.findUnique({
            where: { id: shopId },
            include: { services: true, staff: true }
        });

        if (!shop) {
            console.log('Shop not found');
            return;
        }

        console.log(`Shop Name: ${shop.name}`);
        console.log(`Staff Count: ${shop.staff.length}`);
        for (const s of shop.staff) {
            console.log(` - ${s.name} (${s.id})`);
        }

        console.log(`Services Count: ${shop.services.length}`);
        for (const s of shop.services) {
            console.log(` - ${s.name} (ID: ${s.id}, R$ ${s.price})`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
