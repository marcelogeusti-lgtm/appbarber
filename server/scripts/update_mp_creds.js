const prisma = require('../src/lib/prisma');
const { encrypt } = require('../src/utils/crypto');

const SHOP_ID = 'b4b6f441-bc91-49b9-b9d2-0782c48d458c'; // NextApp
const ACCESS_TOKEN = 'APP_USR-8688307230490391-012821-158b2fcd8e0ab6240e64fae04bf801a4-3166395838';
const PUBLIC_KEY = 'APP_USR-8f71e90b-4bfa-45b0-b38a-9c39a96c7de9';

async function updateCreds() {
    console.log(`=== Updating MP Credentials for Shop NextApp (${SHOP_ID}) ===\n`);

    try {
        // Find existing config
        const config = await prisma.gatewayConfig.findUnique({
            where: {
                barbershopId_gateway: {
                    barbershopId: SHOP_ID,
                    gateway: 'MERCADOPAGO'
                }
            }
        });

        if (!config) {
            console.error('[-] No Mercado Pago config found for this shop.');
            return;
        }

        // Encrypt the Access Token
        const encryptedToken = encrypt(ACCESS_TOKEN);

        const newCredentials = {
            ...config.credentials,
            accessToken: encryptedToken,
            publicKey: PUBLIC_KEY
        };

        // Update in DB
        await prisma.gatewayConfig.update({
            where: { id: config.id },
            data: { 
                credentials: newCredentials,
                isActive: true
            }
        });

        console.log('[+] Success! Credentials updated and encrypted.');
        console.log('    NextApp is now set to use Production keys.');

    } catch (err) {
        console.error('[-] Error updating:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateCreds();
