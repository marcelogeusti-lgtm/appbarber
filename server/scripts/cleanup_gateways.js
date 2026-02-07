const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const barbershopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
    console.log(`Cleaning up gateways for Barbershop: ${barbershopId}`);

    const configs = await prisma.gatewayConfig.findMany({
        where: { barbershopId }
    });

    for (const config of configs) {
        console.log(`Checking ${config.gateway}...`);
        const creds = config.credentials;

        // If Velfy has Mercado Pago keys, wipe it
        if (config.gateway === 'VELFY' && creds.siteId) {
            console.log('  Detected MP keys in Velfy! Wiping credentials.');
            await prisma.gatewayConfig.update({
                where: { id: config.id },
                data: { credentials: {}, isActive: false }
            });
        }
    }

    // Ensure only ONE is active (backup check)
    const activeConfigs = await prisma.gatewayConfig.findMany({
        where: { barbershopId, isActive: true }
    });

    if (activeConfigs.length > 1) {
        console.log(`  Found ${activeConfigs.length} active gateways. Deactivating all but the first one.`);
        for (let i = 1; i < activeConfigs.length; i++) {
            await prisma.gatewayConfig.update({
                where: { id: activeConfigs[i].id },
                data: { isActive: false }
            });
        }
    }

    console.log('Cleanup complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
