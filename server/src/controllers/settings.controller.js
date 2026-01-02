const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get Settings
exports.getSettings = async (req, res) => {
    try {
        const { barbershopId } = req.query;

        let settings = await prisma.barbershopSettings.findUnique({
            where: { barbershopId }
        });

        // Create default settings if not exists
        if (!settings) {
            settings = await prisma.barbershopSettings.create({
                data: {
                    barbershopId,
                    primaryColor: '#f97316',
                    secondaryColor: '#1f2937',
                    accentColor: '#10b981'
                }
            });
        }

        res.json(settings);
    } catch (error) {
        console.error('Get Settings Error:', error);
        res.status(500).json({ message: 'Erro ao buscar configurações.' });
    }
};

// Update Settings
exports.updateSettings = async (req, res) => {
    try {
        const { barbershopId } = req.params;
        const { logoUrl, primaryColor, secondaryColor, accentColor, customDomain } = req.body;

        const settings = await prisma.barbershopSettings.upsert({
            where: { barbershopId },
            update: {
                logoUrl,
                primaryColor,
                secondaryColor,
                accentColor,
                customDomain
            },
            create: {
                barbershopId,
                logoUrl,
                primaryColor: primaryColor || '#f97316',
                secondaryColor: secondaryColor || '#1f2937',
                accentColor: accentColor || '#10b981',
                customDomain
            }
        });

        res.json(settings);
    } catch (error) {
        console.error('Update Settings Error:', error);
        res.status(500).json({ message: 'Erro ao atualizar configurações.' });
    }
};
