const prisma = require('../lib/prisma');

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

// Profissionais ativos que participam do rodízio
async function activePros(barbershopId) {
    return prisma.user.findMany({
        where: { workedBarbershopId: barbershopId, role: { in: ['ADMIN', 'BARBER'] } },
        select: { id: true, name: true }
    });
}

// Calcula a carga de hoje por profissional e retorna quem é o próximo (menos carregado)
async function computeDistribution(barbershopId) {
    const pros = await activePros(barbershopId);
    if (pros.length === 0) return { pros: [], next: null };

    const entries = await prisma.queueEntry.findMany({
        where: { barbershopId, arrivedAt: { gte: startOfToday() }, professionalId: { not: null } },
        select: { professionalId: true }
    });
    const counts = {};
    entries.forEach(e => { counts[e.professionalId] = (counts[e.professionalId] || 0) + 1; });

    const dist = pros.map(p => ({ id: p.id, name: p.name, count: counts[p.id] || 0 }))
        .sort((a, b) => a.count - b.count || a.id.localeCompare(b.id));

    return { pros: dist, next: dist[0] };
}

// Já usado internamente pela fila
exports.pickNext = async (barbershopId) => {
    const cfg = await prisma.rotationConfig.findUnique({ where: { barbershopId } });
    if (!cfg || !cfg.enabled) return null;
    const { next } = await computeDistribution(barbershopId);
    return next ? next.id : null;
};

exports.getConfig = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const cfg = await prisma.rotationConfig.findUnique({ where: { barbershopId } });
        const distribution = await computeDistribution(barbershopId);
        res.json({ enabled: !!(cfg && cfg.enabled), ...distribution });
    } catch (e) {
        console.error('Rotation getConfig error:', e);
        res.status(500).json({ message: 'Erro ao carregar rodízio.' });
    }
};

exports.setConfig = async (req, res) => {
    try {
        const { barbershopId, enabled } = req.body;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const cfg = await prisma.rotationConfig.upsert({
            where: { barbershopId },
            update: { enabled: !!enabled },
            create: { barbershopId, enabled: !!enabled }
        });
        res.json(cfg);
    } catch (e) {
        console.error('Rotation setConfig error:', e);
        res.status(500).json({ message: 'Erro ao salvar rodízio.' });
    }
};
