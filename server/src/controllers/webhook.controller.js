const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

exports.createWebhook = async (req, res) => {
    try {
        const { url, events, active } = req.body;
        const barbershopId = req.user.barbershopId;

        // Count limit check (max 5)
        const count = await prisma.webhook.count({ where: { barbershopId } });
        if (count >= 5) {
            return res.status(400).json({ message: 'Limite de 5 webhooks atingido.' });
        }

        const webhook = await prisma.webhook.create({
            data: {
                url,
                events,
                active: active !== undefined ? active : true,
                barbershopId
            }
        });
        res.status(201).json(webhook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating webhook' });
    }
};

exports.getWebhooks = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId;
        const webhooks = await prisma.webhook.findMany({
            where: { barbershopId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(webhooks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching webhooks' });
    }
};

exports.updateWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        const { url, events, active } = req.body;

        const webhook = await prisma.webhook.update({
            where: { id },
            data: { url, events, active }
        });
        res.json(webhook);
    } catch (error) {
        res.status(500).json({ message: 'Error updating webhook' });
    }
};

exports.deleteWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.webhook.delete({ where: { id } });
        res.json({ message: 'Webhook deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting webhook' });
    }
};

// Internal Helper to Trigger Webhooks
exports.trigger = async (barbershopId, event, payload) => {
    try {
        const webhooks = await prisma.webhook.findMany({
            where: {
                barbershopId,
                active: true,
                events: { has: event } // Filter by event support
            }
        });

        const promises = webhooks.map(hook =>
            axios.post(hook.url, { event, timestamp: new Date(), data: payload })
                .catch(err => console.error(`Webhook failed [${hook.url}]:`, err.message))
        );

        // Don't await, fire and forget
        Promise.allSettled(promises);
    } catch (err) {
        console.error('Trigger error:', err);
    }
};
