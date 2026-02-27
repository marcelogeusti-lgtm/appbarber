const eventBus = require('../events/eventBus');
const whatsappService = require('../communication/WhatsAppService');
const internalNotifier = require('./internalNotifier');
const pushService = require('./PushNotificationService');

console.log('[NotificationService] Initializing listeners...');

// Event: APPOINTMENT_CREATED
eventBus.on('APPOINTMENT_CREATED', async (payload) => {
    console.log(`[NotificationService] Event Received: APPOINTMENT_CREATED for ID ${payload.id}`);

    // 1. Internal Notification (Critical - should always fire)
    try {
        await internalNotifier.createAppointmentNotification(payload);

        // --- Push Notification (FCM) ---
        // We notify the professional about the new appointment
        // We need to find the AuthUser ID linked to the professional User
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const professionalUser = await prisma.user.findUnique({
            where: { id: payload.professionalId },
            select: { authUserId: true }
        });

        if (professionalUser?.authUserId) {
            await pushService.sendToUser(professionalUser.authUserId, '📅 Novo Agendamento!', {
                body: `${payload.client.name} marcou ${payload.service.name} para ${new Date(payload.date).toLocaleDateString('pt-BR')} às ${new Date(payload.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
                url: '/dashboard/appointments'
            });
        }
    } catch (err) {
        console.error('[NotificationService] Internal/Push Notification Failed:', err);
    }

    // 2. WhatsApp Notification (Best Effort - fail safe)
    try {
        const dateObj = new Date(payload.date);
        await whatsappService.sendTemplate(payload.client.phone, 'CONFIRMATION', {
            clientName: payload.client.name,
            barbershopName: payload.barbershop.name,
            date: dateObj.toLocaleDateString('pt-BR'),
            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            serviceName: payload.service.name
        });
    } catch (err) {
        console.error('[NotificationService] WhatsApp Notification Failed:', err);
    }
});

// Event: APPOINTMENT_REMINDER
eventBus.on('APPOINTMENT_REMINDER', async (payload) => {
    console.log(`[NotificationService] Event Received: APPOINTMENT_REMINDER for ID ${payload.id}`);

    try {
        await internalNotifier.createReminderNotification(payload);

        // --- Push Notification (FCM) to Client ---
        if (payload.client?.authUserId) {
            await pushService.sendToUser(payload.client.authUserId, '⏰ Lembrete de Agendamento', {
                body: `Seu horário para ${payload.service.name} na ${payload.barbershop.name} é em 1 hora (${new Date(payload.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}).`,
                url: '/appointments'
            });
        }
    } catch (err) {
        console.error('[NotificationService] Internal Reminder Failed:', err);
    }

    try {
        const dateObj = new Date(payload.date);
        await whatsappService.sendTemplate(payload.client.phone, 'REMINDER', {
            clientName: payload.client.name,
            barbershopName: payload.barbershop.name,
            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
    } catch (err) {
        console.error('[NotificationService] WhatsApp Reminder Failed:', err);
    }
});

// Event: APPOINTMENT_UPDATED (Cancellation, etc)
eventBus.on('APPOINTMENT_UPDATED', async ({ appointment, oldStatus }) => {
    if (appointment.status === 'CANCELLED') {
        // Notify the OTHER party
        // If status changed to CANCELLED, we notify the professional OR the client

        // 1. Notify Professional (if cancelled by system/client)
        const professionalUser = await prisma.user.findUnique({
            where: { id: appointment.professionalId },
            select: { authUserId: true }
        });

        if (professionalUser?.authUserId) {
            await pushService.sendToUser(professionalUser.authUserId, '❌ Agendamento Cancelado', {
                body: `O agendamento de ${appointment.client?.name || 'Cliente'} para ${new Date(appointment.date).toLocaleDateString('pt-BR')} foi cancelado.`,
                url: '/dashboard/appointments'
            });
        }

        // 2. Notify Client (if cancelled by professional/system)
        if (appointment.client?.authUserId) {
            await pushService.sendToUser(appointment.client.authUserId, '❌ Agendamento Cancelado', {
                body: `Seu agendamento para ${appointment.service?.name} na ${appointment.barbershop?.name} foi cancelado.`,
                url: '/appointments'
            });
        }
    }
});

module.exports = {
    init: () => console.log('[NotificationService] Module active.')
};
