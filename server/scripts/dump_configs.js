
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfigs() {
    const email = 'marcelogeusti@gmail.com';
    const user = await prisma.user.findFirst({
        where: { email },
        include: { ownedBarbershops: { include: { gatewayConfigs: true } } }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    const shop = user.ownedBarbershops[0];
    if (!shop) {
        console.log('Shop not found');
        return;
    }

    console.log(`Shop: ${shop.name} (${shop.id})`);
    require('fs').writeFileSync('configs.json', JSON.stringify(shop.gatewayConfigs, null, 2));
    console.log('Configs written to configs.json');
}

checkConfigs()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
