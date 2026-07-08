const prisma = require('../lib/prisma');
const whatsappService = require('../services/communication/WhatsAppService');

// Clientes-alvo (vinculados à barbearia, com telefone), em ordem estável
async function getTargets(barbershopId, audience) {
    const [appt, logs, orders] = await Promise.all([
        prisma.appointment.findMany({ where: { barbershopId }, select: { clientId: true }, distinct: ['clientId'] }),
        prisma.communicationLog.findMany({ where: { barbershopId }, select: { clientId: true }, distinct: ['clientId'] }),
        prisma.order.findMany({ where: { barbershopId }, select: { clientId: true }, distinct: ['clientId'] })
    ]);
    const ids = [...new Set([...appt, ...logs, ...orders].map(x => x.clientId).filter(Boolean))];
    if (ids.length === 0) return [];

    let clients = await prisma.client.findMany({
        where: { id: { in: ids }, active: true, phone: { not: null } },
        select: { id: true, name: true, phone: true, birthDate: true },
        orderBy: { id: 'asc' }
    });

    if (audience === 'BIRTHDAY_MONTH') {
        const m = new Date().getMonth();
        clients = clients.filter(c => c.birthDate && new Date(c.birthDate).getMonth() === m);
    }
    return clients;
}

exports.list = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const campaigns = await prisma.campaign.findMany({ where: { barbershopId }, orderBy: { createdAt: 'desc' }, take: 30 });
        res.json(campaigns);
    } catch (e) {
        console.error('Campaign list error:', e);
        res.status(500).json({ message: 'Erro ao carregar campanhas.' });
    }
};

// Pré-visualização: quantos clientes serão atingidos
exports.preview = async (req, res) => {
    try {
        const { barbershopId, audience } = req.query;
        const targets = await getTargets(barbershopId, audience || 'ALL');
        res.json({ total: targets.length });
    } catch (e) {
        console.error('Campaign preview error:', e);
        res.status(500).json({ message: 'Erro ao calcular público.' });
    }
};

exports.create = async (req, res) => {
    try {
        const { barbershopId, title, message, audience } = req.body;
        if (!barbershopId || !title || !message) return res.status(400).json({ message: 'Título e mensagem são obrigatórios.' });
        const targets = await getTargets(barbershopId, audience || 'ALL');
        const campaign = await prisma.campaign.create({
            data: { barbershopId, title, message, audience: audience || 'ALL', total: targets.length, status: 'DRAFT' }
        });
        res.status(201).json(campaign);
    } catch (e) {
        console.error('Campaign create error:', e);
        res.status(500).json({ message: 'Erro ao criar campanha.' });
    }
};

// Envia um lote (o front chama repetidamente com offset crescente)
exports.sendBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const offset = parseInt(req.body.offset || 0);
        const limit = Math.min(parseInt(req.body.limit || 15), 25);

        const campaign = await prisma.campaign.findUnique({ where: { id } });
        if (!campaign) return res.status(404).json({ message: 'Campanha não encontrada.' });

        const targets = await getTargets(campaign.barbershopId, campaign.audience);
        const slice = targets.slice(offset, offset + limit);

        let sent = 0;
        for (const c of slice) {
            try {
                await whatsappService.sendText(c.phone, campaign.message);
                await prisma.communicationLog.create({
                    data: {
                        barbershopId: campaign.barbershopId, clientId: c.id,
                        channel: 'WHATSAPP', direction: 'OUTBOUND', type: 'CAMPAIGN',
                        content: campaign.message, status: 'SENT'
                    }
                });
                sent++;
            } catch (err) { /* segue mesmo se um falhar */ }
        }

        const newSent = campaign.sentCount + sent;
        const nextOffset = offset + slice.length;
        const done = nextOffset >= targets.length;
        await prisma.campaign.update({
            where: { id },
            data: { sentCount: newSent, status: done ? 'DONE' : 'SENDING' }
        });

        res.json({ sent, totalSent: newSent, total: targets.length, nextOffset, done });
    } catch (e) {
        console.error('Campaign sendBatch error:', e);
        res.status(500).json({ message: 'Erro ao enviar lote.' });
    }
};
