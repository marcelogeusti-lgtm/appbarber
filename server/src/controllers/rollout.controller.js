const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const FeatureFlagService = require('../services/FeatureFlagService');

exports.getFlags = async (req, res) => {
    try {
        const flags = await prisma.featureFlag.findMany({
            include: {
                barbershop: {
                    select: { name: true, slug: true }
                }
            }
        });
        res.json(flags);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao carregar flags.' });
    }
};

exports.rolloutGlobally = async (req, res) => {
    const { key } = req.body;

    if (!key) return res.status(400).json({ message: 'Chave da flag é obrigatória.' });

    try {
        // 1. Delete all individual (tenant-specific) flags for this key
        await prisma.featureFlag.deleteMany({
            where: {
                key,
                barbershopId: { not: null }
            }
        });

        // 2. Set the global flag (barbershopId: null) to enabled: true
        await FeatureFlagService.setFlag(key, true, null, `Global rollout for ${key}`);

        res.json({ message: `Atualização ${key} liberada para todas as barbearias!` });
    } catch (error) {
        console.error('[RolloutController] Error:', error);
        res.status(500).json({ message: 'Erro ao processar rollout global.' });
    }
};

exports.toggleFlag = async (req, res) => {
    const { key, enabled, barbershopId } = req.body;
    try {
        const flag = await FeatureFlagService.setFlag(key, enabled, barbershopId || null);
        res.json(flag);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alternar flag.' });
    }
};
