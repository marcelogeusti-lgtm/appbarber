const prisma = require('../lib/prisma');

const isImageUrl = (u) => /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(u || '');

exports.list = async (req, res) => {
    try {
        const { barbershopId, category } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const where = { barbershopId };
        if (category) where.category = category;
        const rows = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
        res.json(rows);
    } catch (e) {
        console.error('Document list error:', e);
        res.status(500).json({ message: 'Erro ao carregar documentos.' });
    }
};

exports.create = async (req, res) => {
    try {
        const { barbershopId, title, url, category } = req.body;
        if (!barbershopId || !title || !url) return res.status(400).json({ message: 'Título e link são obrigatórios.' });
        const row = await prisma.document.create({
            data: { barbershopId, title, url, category: category || 'GENERAL', isImage: isImageUrl(url) }
        });
        res.status(201).json(row);
    } catch (e) {
        console.error('Document create error:', e);
        res.status(500).json({ message: 'Erro ao salvar documento.' });
    }
};

exports.remove = async (req, res) => {
    try {
        await prisma.document.delete({ where: { id: req.params.id } });
        res.json({ message: 'Removido.' });
    } catch (e) {
        console.error('Document delete error:', e);
        res.status(500).json({ message: 'Erro ao remover.' });
    }
};
