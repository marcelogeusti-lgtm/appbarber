const prisma = require('../lib/prisma');

const FIELDS = ['allergies', 'hairType', 'chemicalHistory', 'preferences', 'notes'];

// Lista clientes que já têm ficha preenchida
exports.list = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const rows = await prisma.anamnesisRecord.findMany({ where: { barbershopId }, orderBy: { updatedAt: 'desc' } });
        res.json(rows);
    } catch (e) {
        console.error('Anamnesis list error:', e);
        res.status(500).json({ message: 'Erro ao carregar fichas.' });
    }
};

// Ficha de um cliente (ou vazio)
exports.getByClient = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        const { clientId } = req.params;
        const row = await prisma.anamnesisRecord.findUnique({ where: { barbershopId_clientId: { barbershopId, clientId } } });
        res.json(row || null);
    } catch (e) {
        console.error('Anamnesis getByClient error:', e);
        res.status(500).json({ message: 'Erro ao carregar ficha.' });
    }
};

// Cria/atualiza a ficha de um cliente
exports.upsert = async (req, res) => {
    try {
        const { barbershopId, clientId } = req.body;
        if (!barbershopId || !clientId) return res.status(400).json({ message: 'Cliente e barbearia são obrigatórios.' });
        const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true } });
        if (!client) return res.status(404).json({ message: 'Cliente não encontrado.' });

        const data = { clientName: client.name };
        for (const f of FIELDS) if (req.body[f] !== undefined) data[f] = req.body[f] || null;

        const row = await prisma.anamnesisRecord.upsert({
            where: { barbershopId_clientId: { barbershopId, clientId } },
            update: data,
            create: { barbershopId, clientId, ...data }
        });
        res.json(row);
    } catch (e) {
        console.error('Anamnesis upsert error:', e);
        res.status(500).json({ message: 'Erro ao salvar ficha.' });
    }
};
