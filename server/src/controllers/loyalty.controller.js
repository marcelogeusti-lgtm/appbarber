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
