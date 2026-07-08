const prisma = require('../lib/prisma');
const { startOfDay, endOfDay } = require('date-fns');

// Rankings: top clientes, profissionais e serviços num período
exports.getRankings = async (req, res) => {
    try {
        const { barbershopId, startDate, endDate } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const start = startDate ? startOfDay(new Date(startDate)) : startOfDay(new Date(new Date().setDate(1)));
        const end = endDate ? endOfDay(new Date(endDate)) : endOfDay(new Date());

        const [orders, appointments] = await Promise.all([
            prisma.order.findMany({
                where: { barbershopId, status: { in: ['CLOSED', 'PAID'] }, paidAt: { gte: start, lte: end } },
                include: {
                    client: { select: { id: true, name: true } },
                    professional: { select: { id: true, name: true } },
                    items: { include: { service: { select: { name: true } } } }
                }
            }),
            prisma.appointment.findMany({
                where: { barbershopId, status: 'COMPLETED', date: { gte: start, lte: end } },
                include: {
                    client: { select: { id: true, name: true } },
                    professional: { select: { id: true, name: true } },
                    service: { select: { name: true, price: true } }
                }
            })
        ]);

        // --- Top Clientes (visitas + valor) ---
        const clients = {};
        const addClient = (id, name, value) => {
            if (!id) return;
            clients[id] = clients[id] || { id, name: name || 'Cliente', visits: 0, total: 0 };
            clients[id].visits += 1;
            clients[id].total += value || 0;
        };
        orders.forEach(o => addClient(o.clientId, o.client?.name, o.total || 0));
        appointments.forEach(a => addClient(a.clientId, a.client?.name, Number(a.service?.price || 0)));

        // --- Top Profissionais (atendimentos + volume) ---
        const pros = {};
        const addPro = (id, name, value) => {
            if (!id) return;
            pros[id] = pros[id] || { id, name: name || 'Profissional', count: 0, total: 0 };
            pros[id].count += 1;
            pros[id].total += value || 0;
        };
        orders.forEach(o => addPro(o.professionalId, o.professional?.name, o.total || 0));
        appointments.forEach(a => addPro(a.professionalId, a.professional?.name, Number(a.service?.price || 0)));

        // --- Top Serviços (quantidade + valor) ---
        const services = {};
        const addService = (name, value) => {
            const key = (name || 'Serviço').trim();
            services[key] = services[key] || { name: key, count: 0, total: 0 };
            services[key].count += 1;
            services[key].total += value || 0;
        };
        orders.forEach(o => (o.items || []).filter(i => i.type === 'SERVICE').forEach(i => addService(i.service?.name, i.total || 0)));
        appointments.forEach(a => addService(a.service?.name, Number(a.service?.price || 0)));

        const sortTop = (obj, key, n = 10) => Object.values(obj).sort((a, b) => b[key] - a[key]).slice(0, n);

        res.json({
            topClientsByValue: sortTop(clients, 'total'),
            topClientsByVisits: sortTop(clients, 'visits'),
            topProfessionals: sortTop(pros, 'total'),
            topServices: sortTop(services, 'count'),
            totals: {
                clients: Object.keys(clients).length,
                orders: orders.length,
                appointments: appointments.length
            }
        });
    } catch (e) {
        console.error('Rankings error:', e);
        res.status(500).json({ message: 'Erro ao carregar rankings.' });
    }
};
