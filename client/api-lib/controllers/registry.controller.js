const prisma = require('../lib/prisma');

// Campos aceitos por entidade (whitelist)
const FIELDS = {
    supplier: ['name', 'phone', 'email', 'cnpj', 'notes', 'active'],
    equipment: ['name', 'quantity', 'notes', 'active'],
    category: ['name', 'type']
};
const MODEL = { supplier: 'supplier', equipment: 'equipment', category: 'category' };

function pick(entity, body) {
    const out = {};
    for (const f of FIELDS[entity]) {
        if (body[f] === undefined) continue;
        if (f === 'quantity') out[f] = Number(body[f]) || 0;
        else if (f === 'active') out[f] = !!body[f];
        else out[f] = body[f];
    }
    return out;
}

exports.list = (entity) => async (req, res) => {
    try {
        const { barbershopId, type } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const where = { barbershopId };
        if (entity === 'category' && type) where.type = type;
        const rows = await prisma[MODEL[entity]].findMany({ where, orderBy: { createdAt: 'desc' } });
        res.json(rows);
    } catch (e) {
        console.error(`${entity} list error:`, e);
        res.status(500).json({ message: 'Erro ao carregar.' });
    }
};

exports.create = (entity) => async (req, res) => {
    try {
        const { barbershopId } = req.body;
        if (!barbershopId || !req.body.name) return res.status(400).json({ message: 'Nome e barbearia são obrigatórios.' });
        const row = await prisma[MODEL[entity]].create({ data: { barbershopId, ...pick(entity, req.body) } });
        res.status(201).json(row);
    } catch (e) {
        console.error(`${entity} create error:`, e);
        res.status(500).json({ message: 'Erro ao criar.' });
    }
};

exports.update = (entity) => async (req, res) => {
    try {
        const row = await prisma[MODEL[entity]].update({ where: { id: req.params.id }, data: pick(entity, req.body) });
        res.json(row);
    } catch (e) {
        console.error(`${entity} update error:`, e);
        res.status(500).json({ message: 'Erro ao atualizar.' });
    }
};

exports.remove = (entity) => async (req, res) => {
    try {
        await prisma[MODEL[entity]].delete({ where: { id: req.params.id } });
        res.json({ message: 'Removido.' });
    } catch (e) {
        console.error(`${entity} delete error:`, e);
        res.status(500).json({ message: 'Erro ao remover.' });
    }
};
