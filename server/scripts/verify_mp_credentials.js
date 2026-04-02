require('dotenv').config();
const { MercadoPagoConfig, Payment } = require('mercadopago');
const prisma = require('../src/lib/prisma');
const { decrypt } = require('../src/utils/crypto');

async function verifyCredentials() {
    console.log('=== Mercado Pago Credential Diagnostic ===\n');

    try {
        // 1. Check Platform Credentials
        const platformToken = process.env.MP_ACCESS_TOKEN;
        if (platformToken) {
            console.log('Checking Platform Access Token...');
            await testToken(platformToken, 'PLATFORM');
        } else {
            console.log('[-] No Platform Access Token found in .env');
        }

        // 2. Check Shop Credentials
        const configs = await prisma.gatewayConfig.findMany({
            where: { gateway: 'MERCADOPAGO' },
            include: { barbershop: true }
        });

        console.log(`\nFound ${configs.length} shops with Mercado Pago configuration:\n`);

        for (const config of configs) {
            console.log(`Checking Shop: ${config.barbershop.name} (ID: ${config.barbershopId})`);
            
            let token = config.credentials?.accessToken;
            if (token) {
                // Attempt decryption
                const decryptedToken = decrypt(token);
                if (decryptedToken) {
                    console.log(' [+] Credential decrypted successfully.');
                    await testToken(decryptedToken, config.barbershop.name);
                } else {
                    console.log(' [-] Decryption FAILED. Check ENCRYPTION_KEY.');
                }
            } else {
                console.log(' [-] No Access Token stored in credentials JSON.');
            }
            console.log('---');
        }

    } catch (err) {
        console.error('\n[FATAL ERROR]:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

async function testToken(token, label) {
    try {
        const client = new MercadoPagoConfig({ accessToken: token });
        const payment = new Payment(client);
        
        // Try a safe list operation to verify token
        // Use search with a dummy query
        const response = await payment.search({
            options: {
                limit: 1
            }
        });
        
        console.log(` [OK] Token for ${label} is VALID.`);
        console.log(`      Permissions/Metadata check successful.`);
    } catch (err) {
        console.log(` [ERROR] Token for ${label} is INVALID:`, err.message);
        if (err.response?.data) {
            console.log('         Details:', JSON.stringify(err.response.data));
        }
    }
}

verifyCredentials();
