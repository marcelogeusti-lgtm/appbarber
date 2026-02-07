const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const barbershopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
    const configs = await prisma.gatewayConfig.findMany({
        where: { barbershopId }
    });
    fs.writeFileSync('db_check.json', JSON.stringify(configs, null, 2));
    console.log('Results written to db_check.json');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
