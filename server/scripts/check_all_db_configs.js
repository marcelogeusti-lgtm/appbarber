const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const barbershopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
    console.log(`Checking all configs for Barbershop: ${barbershopId}`);

    const configs = await prisma.gatewayConfig.findMany({
        where: { barbershopId }
    });

    console.log(JSON.stringify(configs, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
