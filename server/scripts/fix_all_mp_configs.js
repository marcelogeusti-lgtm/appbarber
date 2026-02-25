
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const crypto = require('../src/utils/crypto');
const prisma = new PrismaClient();

async function fixAll() {
    console.log('Fixing ALL MP configs...');
    const tokenToUse = "TEST-7434571932739347-021021-3982873827482384723847-123456789";

    const configs = await prisma.gatewayConfig.findMany({
        where: { gateway: 'MERCADOPAGO' }
    });

    console.log(`Found ${configs.length} MP configs.`);

    for (const config of configs) {
        console.log(`Updating config ${config.id} for shop ${config.barbershopId}`);
        const newCreds = {
            ...(config.credentials || {}),
            accessToken: crypto.encrypt(tokenToUse),
            secretKey: crypto.encrypt(tokenToUse)
        };

        await prisma.gatewayConfig.update({
            where: { id: config.id },
            data: { credentials: newCreds }
        });
    }
    console.log('Done.');
}

fixAll().catch(console.error).finally(() => prisma.$disconnect());
