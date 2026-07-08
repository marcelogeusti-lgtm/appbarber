const prisma = require('../lib/prisma');

exports.list = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const rows = await prisma.clientRestriction.findMany({
            where: { barbershopId, active: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(rows);
    } catch (e) {
        console.error('Restriction list error:', e);
        res.status(500).json({ message: 'Erro ao carregar restrições.' });
    }
};

// Bloqueia um cliente (upsert por barbershop+client)
exports.block = async (req, res) => {
    try {
        const { barbershopId, clientId, reason } = req.body;
        if (!barbershopId || !clientId) return res.status(400).json({ message: 'Cliente e barbearia são obrigatórios.' });

        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true, phone: true } });
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

        const row = await prisma.clientRestriction.upsert({
            where: { barbershopId_clientId: { barbershopId, clientId } },
            update: { active: true, reason: reason || null, clientName: client.name, clientPhone: client.phone },
            create: { barbershopId, clientId, clientName: client.name, clientPhone: client.phone, reason: reason || null, active: true }
        });
        res.status(201).json(row);
    } catch (e) {
        console.error('Restriction block error:', e);
        res.status(500).json({ message: 'Erro ao bloquear cliente.' });
    }
};

// Desbloqueia (remove)
exports.unblock = async (req, res) => {
    try {
        await prisma.clientRestriction.deleteMany({ where: { id: req.params.id } });
        res.json({ message: 'Cliente desbloqueado.' });
    } catch (e) {
        console.error('Restriction unblock error:', e);
        res.status(500).json({ message: 'Erro ao desbloquear.' });
    }
};

// Helper reutilizável: cliente está bloqueado nesta barbearia?
exports.isBlocked = async (barbershopId, clientId) => {
    if (!barbershopId || !clientId) return false;
    const r = await prisma.clientRestriction.findUnique({
        where: { barbershopId_clientId: { barbershopId, clientId } },
        select: { active: true }
    });
    return !!(r && r.active);
};
