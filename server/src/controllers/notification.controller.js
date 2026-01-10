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

// --- User Notifications Logic ---

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        await prisma.notification.updateMany({
            where: { id, userId }, // Ensure ownership
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Mark read error:', error);
        res.status(500).json({ message: 'Error marking notification' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Error marking all notifications' });
    }
};

// Helper function to create notification (internal use)
exports.createNotification = async ({ userId, title, message, type, appointmentId, orderId }) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                appointmentId,
                orderId
            }
        });

        // TODO: Emit Socket event if needed
        // if (global.io) { global.io.to(userId).emit('new_notification', ...); }
    } catch (error) {
        console.error('Create notification error:', error);
    }
};
