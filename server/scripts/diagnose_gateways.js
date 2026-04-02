const { PrismaClient } = require('@prisma/client');
const crypto = require('../src/lib/crypto');
const prisma = new PrismaClient();

async function diagnose() {
    console.log('--- DIAGNÓSTICO DE GATEWAYS ---');
    
    const configs = await prisma.gatewayConfig.findMany({
        include: { barbershop: true }
    });

    console.log(`Encontradas ${configs.length} configurações.`);

    for (const c of configs) {
        let token = 'N/A';
        try {
            const creds = typeof c.credentials === 'string' ? JSON.parse(c.credentials) : c.credentials;
            const rawToken = creds.accessToken || creds.access_token;
            
            if (rawToken && rawToken.includes(':')) {
                token = crypto.decrypt(rawToken) || 'ERRO_DECRIPT';
            } else {
                token = rawToken || 'VAZIO';
            }
        } catch (e) {
            token = 'ERRO_PARSE';
        }

        const prefix = token.substring(0, 10);
        console.log(`Shop: ${c.barbershop.name} (ID: ${c.barbershopId})`);
        console.log(`  Gateway: ${c.gateway}`);
        console.log(`  Ativo: ${c.isActive}`);
        console.log(`  Token Prefix: ${prefix}...`);
        console.log('---------------------------');
    }

    process.exit(0);
}

diagnose();
