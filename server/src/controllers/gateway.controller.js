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
        const barbershopId = req.user.barbershopId || req.user.barbershop?.id;

        if (!gateway || !credentials) {
            return res.status(400).json({ error: 'Gateway and credentials are required' });
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
            if (val && typeof val === 'string' && !val.includes('...')) {
                // It's a new plain text value (or the user pasted a new key that happens to have ... but unlikely for these keys)
                // We double check if it DOES NOT match the old encrypted value (if needed), but here logical flow is:
                // If it was masked '...', we replaced it with OLD encrypted value.
                // If it is NOT masked, it is NEW plain text. So we encrypt it.
                // We should checks if it's already encrypted format (iv:content)? No, user enters plain text.
                // Avoid double encryption if something weird happens, but unlikely.

                // One edge case: if user enters a key that looks like "val...ue", it might be treated as masked?
                // The mask is `slice(0,4)...slice(-4)`.
                // We assume user won't enter a Key that matches the mask format exactly.

                // Perform Encryption
                finalCredentials[field] = crypto.encrypt(val);
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
        console.error('Save Gateway Config Error:', error);
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
