const eventBus = require('../events/eventBus');
const whatsappService = require('../communication/WhatsAppService');
const internalNotifier = require('./internalNotifier');

console.log('[NotificationService] Initializing listeners...');

// Event: APPOINTMENT_CREATED
eventBus.on('APPOINTMENT_CREATED', async (payload) => {
    console.log(`[NotificationService] Event Received: APPOINTMENT_CREATED for ID ${payload.id}`);

    // 1. Internal Notification (Critical - should always fire)
    try {
        await internalNotifier.createAppointmentNotification(payload);
    } catch (err) {
        console.error('[NotificationService] Internal Notification Failed:', err);
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

module.exports = {
    init: () => console.log('[NotificationService] Module active.')
};
