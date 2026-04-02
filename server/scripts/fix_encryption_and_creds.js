require('dotenv').config();
const prisma = require('../src/lib/prisma');
const crypto = require('../src/utils/crypto');

async function fixCredentials() {
    console.log('=== 🛠️ Mercado Pago Credentials Sync 🛠️ ===\n');

    // 1. Check Encryption Key
    if (!process.env.ENCRYPTION_KEY) {
        console.warn('⚠️  ENCRYPTION_KEY is missing in .env');
        console.log('💡 Tip: Generate a 32-byte hex string (64 characters) and add to .env:');
        console.log(`ENCRYPTION_KEY=${require('crypto').randomBytes(32).toString('hex')}\n`);
    } else {
        console.log('✅ ENCRYPTION_KEY detected.\n');
    }

    // 2. Scan GatewayConfigs
    const configs = await prisma.gatewayConfig.findMany({
        include: { barbershop: true }
    });

    console.log(`Found ${configs.length} gateway configurations.\n`);

    for (const config of configs) {
        const shopName = config.barbershop?.name || 'Unknown Shop';
        const hasCredentials = config.credentials && Object.keys(config.credentials).length > 0;

        if (!hasCredentials) {
            console.log(`❌ [${shopName}] No credentials set.`);
        } else {
            // Test decryption
            const sampleField = 'accessToken';
            if (config.credentials[sampleField]) {
                const decrypted = crypto.decrypt(config.credentials[sampleField]);
                if (decrypted) {
                    console.log(`✅ [${shopName}] Credentials readable.`);
                } else {
                    console.log(`⚠️  [${shopName}] Credentials NOT readable! (Might be encrypted with a different key)`);
                }
            } else {
                console.log(`⚠️  [${shopName}] accessToken field missing from credentials object.`);
            }
        }
    }

    console.log('\n=== ✅ Review Finished ===');
    console.log('If some credentials are not readable, you should re-save them in the Dashboard.');
}

fixCredentials()
    .catch(err => console.error(err))
    .finally(() => prisma.$disconnect());
