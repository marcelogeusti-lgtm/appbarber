const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50'; // Marcelo Geusti
        console.log(`--- Checking Shop: ${shopId} (Marcelo Geusti) ---`);

        const services = await prisma.service.findMany({
            where: { barbershopId: shopId }
        });

        console.log(`Found ${services.length} services.`);
        for (const s of services) {
            console.log(` - ${s.name} (Active: ${s.active}, Price: ${s.price})`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
