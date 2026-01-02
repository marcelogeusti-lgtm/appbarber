const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

exports.addToWaitlist = async (req, res) => {
    try {
        const { barbershopId, serviceId, date, name, phone } = req.body;

        const waitlistEntry = await prisma.waitlist.create({
            data: {
                barbershopId,
                serviceId,
                date: new Date(date),
                clientName: name,
                clientPhone: phone
            },
            include: { service: true }
        });

        // Trigger n8n for waitlist tracking
        const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
        const webhookUrl = barbershop?.webhookUrl;

        if (webhookUrl) {
            axios.post(webhookUrl, {
                event: 'waitlist.added',
                data: {
                    id: waitlistEntry.id,
                    barbershopId,
                    date,
                    clientName: name,
                    clientPhone: phone,
                    serviceName: waitlistEntry.service?.name
                }
            }).catch(e => console.error('Waitlist Webhook Error:', e.message));
        }

        res.status(201).json({ message: 'Adicionado à lista de espera com sucesso!', waitlistEntry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao entrar na lista de espera' });
    }
};

exports.getWaitlist = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        const list = await prisma.waitlist.findMany({
            where: { barbershopId },
            include: { service: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};
