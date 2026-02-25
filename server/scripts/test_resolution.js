
require('dotenv').config();
const orchestrator = require('../src/services/payment/PaymentOrchestrator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const barbershop = await prisma.barbershop.findFirst({
        include: { gatewayConfigs: true }
    });

    if (!barbershop) return console.log('No shop');

    const mpConfig = barbershop.gatewayConfigs.find(c => c.gateway === 'MERCADOPAGO');
    console.log('RAW DB Creds:', JSON.stringify(mpConfig?.credentials, null, 2));

    console.log('Orchestrator resolving for shop:', barbershop.id);
    const creds = await orchestrator.getGatewayConfig(barbershop.id, 'mercadopago');

    console.log('Resolved Credentials Keys:', Object.keys(creds));
    if (creds.accessToken) {
        console.log('Access Token Present!');
        console.log('Token Start:', creds.accessToken.substring(0, 10));
    } else {
        console.log('Access Token MISSING in resolved creds.');
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
