const prisma = require('../lib/prisma');
const whatsappService = require('../services/communication/WhatsAppService');

// Clientes vinculados à barbearia com aniversário hoje ou no mês
async function getBirthdayClients(barbershopId, scope = 'today') {
    const [appt, logs, orders] = await Promise.all([
        prisma.appointment.findMany({ where: { barbershopId }, select: { clientId: true }, distinct: ['clientId'] }),
        prisma.communicationLog.findMany({ where: { barbershopId }, select: { clientId: true }, distinct: ['clientId'] }),
        prisma.order.findMany({ where: { barbershopId }, select: { clientId: true }, distinct: ['clientId'] })
    ]);
    const ids = [...new Set([...appt, ...logs, ...orders].map(x => x.clientId).filter(Boolean))];
    if (ids.length === 0) return [];

    const clients = await prisma.client.findMany({
        where: { id: { in: ids }, active: true, birthDate: { not: null } },
        select: { id: true, name: true, phone: true, birthDate: true }
    });

    const now = new Date();
    return clients.filter(c => {
        const b = new Date(c.birthDate);
        if (scope === 'month') return b.getMonth() === now.getMonth();
        return b.getMonth() === now.getMonth() && b.getDate() === now.getDate();
    }).sort((a, b) => new Date(a.birthDate).getDate() - new Date(b.birthDate).getDate());
}

function defaultMessage(name, shopName) {
    const first = (name || '').split(' ')[0];
    return `🎉 Feliz aniversário, ${first}! A equipe da ${shopName || 'nossa barbearia'} te deseja um dia incrível. Passa aqui pra comemorar com aquele corte! 💈`;
}

// Relatório para o painel
exports.report = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const [today, month] = await Promise.all([
            getBirthdayClients(barbershopId, 'today'),
            getBirthdayClients(barbershopId, 'month')
        ]);
        res.json({ today, month });
    } catch (e) {
        console.error('Birthday report error:', e);
        res.status(500).json({ message: 'Erro ao carregar aniversariantes.' });
    }
};

// Envio manual (um cliente ou todos de hoje)
exports.sendGreeting = async (req, res) => {
    try {
        const { barbershopId, clientId, message } = req.body;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });
        const shop = await prisma.barbershop.findUnique({ where: { id: barbershopId }, select: { name: true } });

        let targets;
        if (clientId) {
            const c = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true, name: true, phone: true } });
            targets = c ? [c] : [];
        } else {
            targets = await getBirthdayClients(barbershopId, 'today');
        }

        let sent = 0;
        for (const c of targets) {
            if (!c.phone) continue;
            const text = message || defaultMessage(c.name, shop?.name);
            try {
                await whatsappService.sendText(c.phone, text);
                await prisma.communicationLog.create({ data: { barbershopId, clientId: c.id, channel: 'WHATSAPP', direction: 'OUTBOUND', type: 'BIRTHDAY', content: text, status: 'SENT' } });
                sent++;
            } catch (err) { /* segue */ }
        }
        res.json({ sent, total: targets.length });
    } catch (e) {
        console.error('Birthday send error:', e);
        res.status(500).json({ message: 'Erro ao enviar parabéns.' });
    }
};

// Cron diário (Vercel Cron): dispara parabéns em todas as barbearias
exports.runCron = async (req, res) => {
    try {
        const secret = process.env.CRON_SECRET;
        if (secret) {
            const auth = req.headers['authorization'] || '';
            const q = req.query.secret;
            if (auth !== `Bearer ${secret}` && q !== secret) {
                return res.status(401).json({ message: 'Unauthorized' });
            }
        }

        const shops = await prisma.barbershop.findMany({ select: { id: true, name: true } });
        const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
        let totalSent = 0;

        for (const shop of shops) {
            const targets = await getBirthdayClients(shop.id, 'today');
            for (const c of targets) {
                if (!c.phone) continue;
                // idempotência: já mandou parabéns hoje?
                const already = await prisma.communicationLog.findFirst({
                    where: { barbershopId: shop.id, clientId: c.id, type: 'BIRTHDAY', createdAt: { gte: startOfDay } }, select: { id: true }
                });
                if (already) continue;
                const text = defaultMessage(c.name, shop.name);
                try {
                    await whatsappService.sendText(c.phone, text);
                    await prisma.communicationLog.create({ data: { barbershopId: shop.id, clientId: c.id, channel: 'WHATSAPP', direction: 'OUTBOUND', type: 'BIRTHDAY', content: text, status: 'SENT' } });
                    totalSent++;
                } catch (err) { /* segue */ }
            }
        }
        res.json({ ok: true, totalSent });
    } catch (e) {
        console.error('Birthday cron error:', e);
        res.status(500).json({ message: 'Erro no cron de aniversários.' });
    }
};
