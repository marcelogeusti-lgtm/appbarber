const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTemplates = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId;

        // Fetch Global Templates
        const globalTemplates = await prisma.notificationTemplate.findMany({
            where: { barbershopId: null }
        });

        // Fetch Barbershop specific Templates
        let localTemplates = [];
        if (barbershopId) {
            localTemplates = await prisma.notificationTemplate.findMany({
                where: { barbershopId }
            });
        }

        // Merge logic
        // We want to return a list of templates. One for each TYPE.
        // If local exists, use local. Else user global.

        // Let's create a map by Type
        const templateMap = {};

        // Populate with globals first
        globalTemplates.forEach(t => {
            templateMap[t.type] = { ...t, isGlobal: true };
        });

        // Override with locals
        localTemplates.forEach(t => {
            templateMap[t.type] = { ...t, isGlobal: false };
        });

        res.json(Object.values(templateMap));
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ message: 'Error fetching notification templates' });
    }
};

exports.saveTemplate = async (req, res) => {
    try {
        const barbershopId = req.user.barbershopId;
        const { type, content, active } = req.body;

        if (!barbershopId) {
            return res.status(400).json({ message: 'Barbershop context required' });
        }

        // Check if exists
        const existing = await prisma.notificationTemplate.findFirst({
            where: {
                barbershopId,
                type
            }
        });

        let template;
        if (existing) {
            template = await prisma.notificationTemplate.update({
                where: { id: existing.id },
                data: { content, active }
            });
        } else {
            // Need a name, let's derive from type or use Generic
            // Global templates have names, we can try to copy or just use type name
            template = await prisma.notificationTemplate.create({
                data: {
                    barbershopId,
                    type,
                    content,
                    active,
                    name: type // Placeholder, internal name
                }
            });
        }

        res.json(template);
    } catch (error) {
        console.error('Save template error:', error);
        res.status(500).json({ message: 'Error saving template' });
    }
};
