const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50'; // Marcelo Geusti
        console.log(`--- Checking Shop Staff: ${shopId} ---`);

        const shop = await prisma.barbershop.findUnique({
            where: { id: shopId },
            include: {
                staff: {
                    select: { id: true, name: true, workedBarbershopId: true }
                }
            }
        });

        if (!shop) {
            console.log('Shop not found');
            return;
        }

        console.log(`Shop: ${shop.name}`);
        console.log(`Staff List:`);
        for (const s of shop.staff) {
            console.log(` - ${s.name} (ID: ${s.id}, workedBarbershopId: ${s.workedBarbershopId})`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
