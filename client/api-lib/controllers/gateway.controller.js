const prisma = require('../lib/prisma');

// Helper to mask secrets
function maskCredentials(gateway, credentials) {
    if (!credentials) return {};
    const masked = { ...credentials };

    // Mask common secret fields
    const secretFields = ['apiKey', 'secretKey', 'accessToken', 'clientSecret'];

    secretFields.forEach(field => {
        if (masked[field] && masked[field].length > 4) {
            masked[field] = `${masked[field].slice(0, 4)}...${masked[field].slice(-4)}`;
        }
    });

    return masked;
}

exports.saveConfig = async (req, res) => {
    try {
        const { credentials, isActive } = req.body;
        const gateway = req.body.gateway?.toUpperCase();
        let barbershopId = req.user.barbershopId || req.user.barbershop?.id;

        // Fallback: If not in token, look up from DB
        if (!barbershopId) {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: {
                    ownedBarbershops: { select: { id: true } }
                }
            });
            barbershopId = user?.ownedBarbershops?.[0]?.id;
        }

        if (!barbershopId) {
            return res.status(400).json({ error: 'Barbershop ID context missing. Please ensure you are linked to a barbershop.' });
        }

        if (!gateway || !credentials) {
            return res.status(400).json({ error: 'Gateway and credentials are required' });
        }

        // --- VALIDAÇÃO REAL DA CHAVE NO PROVEDOR ---
        // Quando uma chave secreta NOVA chega (não mascarada/criptografada),
        // testamos direto na API do gateway antes de salvar — assim o barbeiro
        // sabe na hora se copiou a chave certa.
        const axios = require('axios');
        const isRealValue = (v) => v && typeof v === 'string' && !v.includes('...') && !v.includes(':');

        if (gateway === 'STRIPE' && isRealValue(credentials.secretKey)) {
            if (!credentials.secretKey.startsWith('sk_')) {
                return res.status(400).json({ error: 'A Secret Key da Stripe deve começar com "sk_". Confira se você copiou a chave certa (não a Publishable).' });
            }
            try {
                await axios.get('https://api.stripe.com/v1/balance', {
                    headers: { Authorization: `Bearer ${credentials.secretKey}` },
                    timeout: 15000
                });
            } catch (verr) {
                return res.status(400).json({ error: 'A Stripe recusou esta Secret Key. Confira em stripe.com → Developers → API keys e cole novamente.' });
            }
        }
        if (gateway === 'STRIPE' && isRealValue(credentials.publicKey) && !credentials.publicKey.startsWith('pk_')) {
            return res.status(400).json({ error: 'A Publishable Key da Stripe deve começar com "pk_". Confira se você copiou a chave certa.' });
        }

        if (gateway === 'MERCADOPAGO' && isRealValue(credentials.accessToken)) {
            try {
                await axios.get('https://api.mercadopago.com/users/me', {
                    headers: { Authorization: `Bearer ${credentials.accessToken}` },
                    timeout: 15000
                });
            } catch (verr) {
                return res.status(400).json({ error: 'O Mercado Pago recusou este Access Token. Confira as credenciais de produção e cole novamente.' });
            }
        }

        // --- MANDATORY VALIDATION FOR ACTIVATION ---
        // Cada gateway tem seu par de chaves: MP usa accessToken, Stripe usa secretKey
        const secretFieldName = gateway === 'STRIPE' ? 'secretKey' : 'accessToken';
        const secretLabel = gateway === 'STRIPE' ? 'Secret Key' : 'Access Token';

        if (isActive) {
            // Check if we have credentials in this request OR if they already exist in DB
            const hasPublicKey = credentials.publicKey && (credentials.publicKey.length > 0);
            const hasSecret = credentials[secretFieldName] && (credentials[secretFieldName].length > 0);

            // Fetch existing config to see if we already have these keys (masked or encrypted)
            const existingConfig = await prisma.gatewayConfig.findUnique({
                where: { barbershopId_gateway: { barbershopId, gateway } }
            });

            const dbHasPublicKey = existingConfig?.credentials?.publicKey;
            const dbHasSecret = existingConfig?.credentials?.[secretFieldName];

            if (!(hasPublicKey || dbHasPublicKey) || !(hasSecret || dbHasSecret)) {
                return res.status(400).json({
                    error: `Para ativar o ${gateway}, é obrigatório configurar a Public Key e a ${secretLabel}.`
                });
            }
        }

        // Validate structure based on gateway? (For now, trust frontend/schema)

        // Fetch existing config to check for masked values
        const existingConfig = await prisma.gatewayConfig.findUnique({
            where: {
                barbershopId_gateway: {
                    barbershopId,
                    gateway
                }
            }
        });

        let finalCredentials = { ...credentials };

        if (existingConfig && existingConfig.credentials) {
            const oldCreds = existingConfig.credentials;
            // Merge: If current field is masked (e.g. contains '...'), use the old value
            Object.keys(credentials).forEach(key => {
                if (typeof credentials[key] === 'string' && credentials[key].includes('...')) {
                    finalCredentials[key] = oldCreds[key];
                }
            });
        }

        // Encrypt Sensitive Fields if they are new (not merged from old masked values)
        const crypto = require('../utils/crypto');
        const sensitiveFields = ['secretKey', 'apiKey', 'accessToken', 'clientSecret'];

        sensitiveFields.forEach(field => {
            const val = finalCredentials[field];
            if (val && typeof val === 'string') {
                // Check if it's NOT masked and NOT already encrypted
                const isMasked = val.includes('...');
                const isEncrypted = /^[0-9a-f]{32}:[0-9a-f]+$/.test(val);

                if (!isMasked && !isEncrypted) {
                    // It's a new plain text value. Encrypt it.
                    finalCredentials[field] = crypto.encrypt(val);
                }
            }
        });

        if (isActive) {
            // Deactivate all other gateways for this barbershop in a transaction for safety
            await prisma.gatewayConfig.updateMany({
                where: {
                    barbershopId,
                    gateway: { not: gateway.toUpperCase() }
                },
                data: { isActive: false }
            });
        }

        const config = await prisma.gatewayConfig.upsert({
            where: {
                barbershopId_gateway: {
                    barbershopId,
                    gateway
                }
            },
            update: {
                credentials: finalCredentials,
                isActive: !!isActive, // Ensure boolean
                updatedAt: new Date()
            },
            create: {
                barbershopId,
                gateway,
                credentials: finalCredentials,
                isActive: !!isActive
            }
        });

        return res.json({
            message: 'Config saved',
            config: {
                ...config,
                credentials: maskCredentials(gateway, config.credentials)
            }
        });

    } catch (error) {
        (req.log || require('../lib/logger')).error({ err: error, action: 'gateway_config_save_failed' }, 'Erro ao salvar configuração de gateway');
        return res.status(500).json({ error: 'Failed to save configuration' });
    }
};

exports.getConfigs = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId || req.user.barbershop?.id;

        const configs = await prisma.gatewayConfig.findMany({
            where: { barbershopId }
        });

        const maskedConfigs = configs.map(cfg => ({
            ...cfg,
            credentials: maskCredentials(cfg.gateway, cfg.credentials)
        }));

        return res.json(maskedConfigs);

    } catch (error) {
        console.error('Get Gateway Config Error:', error);
        return res.status(500).json({ error: 'Failed to fetch configurations' });
    }
};
