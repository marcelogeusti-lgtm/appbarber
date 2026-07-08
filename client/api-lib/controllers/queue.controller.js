const prisma = require('../lib/prisma');

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

// Fila atual (aguardando + chamados) do dia
exports.getQueue = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const [waiting, history] = await Promise.all([
            prisma.queueEntry.findMany({
                where: { barbershopId, status: { in: ['WAITING', 'CALLED'] } },
                orderBy: { arrivedAt: 'asc' }
            }),
            prisma.queueEntry.findMany({
                where: { barbershopId, status: { in: ['ATTENDED', 'CANCELLED'] }, arrivedAt: { gte: startOfToday() } },
                orderBy: { updatedAt: 'desc' },
                take: 50
            })
        ]);

        // enriquecer nome do profissional
        const proIds = [...new Set([...waiting, ...history].map(e => e.professionalId).filter(Boolean))];
        const pros = proIds.length ? await prisma.user.findMany({ where: { id: { in: proIds } }, select: { id: true, name: true } }) : [];
        const proMap = Object.fromEntries(pros.map(p => [p.id, p.name]));
        const decorate = (e) => ({ ...e, professionalName: e.professionalId ? proMap[e.professionalId] : null });

        res.json({ waiting: waiting.map(decorate), history: history.map(decorate) });
    } catch (e) {
        console.error('Queue get error:', e);
        res.status(500).json({ message: 'Erro ao carregar a fila.' });
    }
};

// Adiciona alguém na fila
exports.addToQueue = async (req, res) => {
    try {
        const { barbershopId, clientId, clientName, clientPhone, professionalId, serviceName, notes } = req.body;
        if (!barbershopId || !clientName) return res.status(400).json({ message: 'Nome e barbearia são obrigatórios.' });

        // Sem profissional escolhido? Se o rodízio estiver ligado, atribui o próximo da vez.
        let finalProId = professionalId && professionalId !== 'all' ? professionalId : null;
        if (!finalProId) {
            try {
                const { pickNext } = require('./rotation.controller');
                finalProId = await pickNext(barbershopId);
            } catch (e) { /* rodízio opcional */ }
        }

        const entry = await prisma.queueEntry.create({
            data: {
                barbershopId,
                clientId: clientId || null,
                clientName: String(clientName).trim(),
                clientPhone: clientPhone || null,
                professionalId: finalProId,
                serviceName: serviceName || null,
                notes: notes || null,
                status: 'WAITING'
            }
        });
        res.status(201).json(entry);
    } catch (e) {
        console.error('Queue add error:', e);
        res.status(500).json({ message: 'Erro ao adicionar na fila.' });
    }
};

// Muda o status (chamar / atender / cancelar)
const STATUS = { CALLED: 'calledAt', ATTENDED: 'attendedAt' };
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['WAITING', 'CALLED', 'ATTENDED', 'CANCELLED'].includes(status)) {
            return res.status(400).json({ message: 'Status inválido.' });
        }
        const data = { status };
        if (STATUS[status]) data[STATUS[status]] = new Date();
        const entry = await prisma.queueEntry.update({ where: { id }, data });
        res.json(entry);
    } catch (e) {
        console.error('Queue status error:', e);
        res.status(500).json({ message: 'Erro ao atualizar a fila.' });
    }
};

// Chamar o próximo da fila (primeiro WAITING)
exports.callNext = async (req, res) => {
    try {
        const { barbershopId } = req.body;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const next = await prisma.queueEntry.findFirst({
            where: { barbershopId, status: 'WAITING' },
            orderBy: { arrivedAt: 'asc' }
        });
        if (!next) return res.status(404).json({ message: 'Não há ninguém aguardando na fila.' });
        const entry = await prisma.queueEntry.update({
            where: { id: next.id },
            data: { status: 'CALLED', calledAt: new Date() }
        });
        res.json(entry);
    } catch (e) {
        console.error('Queue callNext error:', e);
        res.status(500).json({ message: 'Erro ao chamar o próximo.' });
    }
};
