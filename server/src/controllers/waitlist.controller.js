const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const saasPlans = require('../config/saasPlans');

exports.addToWaitlist = async (req, res) => {
    try {
        const { barbershopId, serviceId, date, name, phone, professionalId } = req.body;
        // console.log('Waitlist Data:', { barbershopId, serviceId, date, name, phone, professionalId });

        const waitlistEntry = await prisma.waitlist.create({
            data: {
                barbershopId,
                serviceId,
                date: new Date(date),
                clientName: name,
                clientPhone: phone,
                professionalId: professionalId || null
            },
            include: { service: true }
        });

        // Trigger n8n for waitlist tracking
        const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
        const webhookUrl = barbershop?.webhookUrl;

        const userPlan = barbershop?.saasPlan || 'BASIC';
        const planConfig = saasPlans[userPlan] || saasPlans.BASIC;
        const hasWebhookFeature = planConfig.features.includes('all') || planConfig.features.includes('webhook');

        if (webhookUrl && hasWebhookFeature) {
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
        const { barbershopId, date, professionalId } = req.query;

        const where = { barbershopId };
        if (date) {
            const startStr = date.split('T')[0];
            const startDate = new Date(startStr);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            where.date = {
                gte: startDate,
                lt: endDate
            };
        }
        if (professionalId && professionalId !== 'all') {
            where.professionalId = professionalId;
        }

        const list = await prisma.waitlist.findMany({
            where,
            include: { service: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};
