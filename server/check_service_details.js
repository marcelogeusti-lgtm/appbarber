const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50'; // Marcelo Geusti
        const service = await prisma.service.findFirst({
            where: { name: 'Corte Degradê', barbershopId: shopId }
        });

        if (!service) {
            console.log('Service not found');
            return;
        }

        console.log('--- Service Details ---');
        console.log(`Name: ${service.name}`);
        console.log(`ID: ${service.id}`);
        console.log(`Duration: ${service.duration}`);
        console.log(`Price: ${service.price}`);
        console.log(`Active: ${service.active}`);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
