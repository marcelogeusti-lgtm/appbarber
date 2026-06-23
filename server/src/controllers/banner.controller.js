const prisma = require('../lib/prisma');

exports.getBanners = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify ownership
        if (req.user.role !== 'SUPER_ADMIN' && req.user.barbershopId !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const banners = await prisma.banner.findMany({
            where: { barbershopId: id },
            orderBy: { createdAt: 'desc' }
        });

        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ message: 'Erro ao buscar banners' });
    }
};

exports.createBanner = async (req, res) => {
    try {
        const { id } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.barbershopId !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { title, imageUrl, linkUrl, ctaText, startDate, endDate, location, active } = req.body;

        const banner = await prisma.banner.create({
            data: {
                barbershopId: id,
                title,
                imageUrl,
                linkUrl,
                ctaText,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                location: location || 'DASHBOARD_TOP',
                active: active !== undefined ? active : true
            }
        });

        res.status(201).json(banner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ message: 'Erro ao criar banner' });
    }
};

exports.updateBanner = async (req, res) => {
    try {
        const { id, bannerId } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.barbershopId !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { title, imageUrl, linkUrl, ctaText, startDate, endDate, location, active } = req.body;

        const banner = await prisma.banner.update({
            where: { id: bannerId },
            data: {
                title,
                imageUrl,
                linkUrl,
                ctaText,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                location,
                active
            }
        });

        res.json(banner);
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Erro ao atualizar banner' });
    }
};

exports.deleteBanner = async (req, res) => {
    try {
        const { id, bannerId } = req.params;
        if (req.user.role !== 'SUPER_ADMIN' && req.user.barbershopId !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await prisma.banner.delete({
            where: { id: bannerId }
        });

        res.status(204).send();
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ message: 'Erro ao deletar banner' });
    }
};
