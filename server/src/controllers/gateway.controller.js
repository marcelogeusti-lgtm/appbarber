const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        const { gateway, credentials, isActive } = req.body;
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

        if (isActive) {
            // Deactivate all other gateways for this barbershop
            await prisma.gatewayConfig.updateMany({
                where: {
                    barbershopId,
                    gateway: { not: gateway }
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
                isActive,
                updatedAt: new Date()
            },
            create: {
                barbershopId,
                gateway,
                credentials: finalCredentials,
                isActive
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
