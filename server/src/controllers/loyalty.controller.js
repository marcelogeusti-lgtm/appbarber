const prisma = require('../lib/prisma');

exports.getLoyaltySettings = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const settings = await prisma.loyaltyProgram.findUnique({
            where: { barbershopId }
        });

        res.json(settings || { active: false, pointsPerReal: 1, minPointsToRedeem: 100 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching loyalty settings' });
    }
};

exports.updateLoyaltySettings = async (req, res) => {
    try {
        const { barbershopId } = req.body; // Or from req.user/params
        const { active, pointsPerReal, rewardDescription, minPointsToRedeem } = req.body;

        const effectiveBarbershopId = req.user?.barbershopId || barbershopId;

        if (!effectiveBarbershopId) {
            return res.status(400).json({ message: 'Barbershop ID required' });
        }

        const settings = await prisma.loyaltyProgram.upsert({
            where: { barbershopId: effectiveBarbershopId },
            update: {
                active,
                pointsPerReal: parseFloat(pointsPerReal),
                rewardDescription,
                minPointsToRedeem: parseInt(minPointsToRedeem)
            },
            create: {
                barbershopId: effectiveBarbershopId,
                active,
                pointsPerReal: parseFloat(pointsPerReal),
                rewardDescription,
                minPointsToRedeem: parseInt(minPointsToRedeem)
            }
        });

        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating loyalty settings' });
    }
};

exports.getAppleWalletPass = async (req, res) => {
    try {
        const WalletService = require('../services/WalletService');
        const { barbershopId } = req.query;
        const clientId = req.user.id;

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const passBuffer = await WalletService.generateApplePass(clientId, barbershopId);

        if (!passBuffer) {
            return res.status(400).json({ message: 'Integração com Apple Wallet não está configurada para esta Barbearia.' });
        }

        res.setHeader('Content-Type', 'application/vnd.apple.pkpass');
        res.setHeader('Content-Disposition', 'attachment; filename=fidelidade.pkpass');
        res.send(passBuffer);

    } catch (error) {
        console.error('[LoyaltyController] Apple Wallet Error:', error);
        res.status(500).json({ message: error.message || 'Erro ao gerar passe da Apple Wallet' });
    }
};

exports.getGoogleWalletUrl = async (req, res) => {
    try {
        const WalletService = require('../services/WalletService');
        const { barbershopId } = req.query;
        const clientId = req.user.id;

        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const saveUrl = await WalletService.generateGoogleWalletUrl(clientId, barbershopId);

        if (!saveUrl) {
            return res.status(400).json({ message: 'Integração com Google Wallet não está configurada para esta Barbearia.' });
        }

        res.json({ saveUrl });

    } catch (error) {
        console.error('[LoyaltyController] Google Wallet Error:', error);
        res.status(500).json({ message: error.message || 'Erro ao gerar link da Google Wallet' });
    }
};
