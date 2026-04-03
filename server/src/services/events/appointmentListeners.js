const eventBus = require('./eventBus');
const communicationService = require('../communication/CommunicationService');
const notificationController = require('../../controllers/notification.controller');
const { format } = require('date-fns');

/**
 * AppointmentEventsListener
 * Listens to appointment-related events and triggers automated communication.
 */
function init() {
    console.log('[Events] Initializing AppointmentEventsListener...');

    // 1. Appointment CREATED (Confirmed/Pending)
    eventBus.on('APPOINTMENT_CREATED', async (appointment) => {
        console.log(`[Event] APPOINTMENT_CREATED: ${appointment.id} (Status: ${appointment.status})`);
        
        // Skip automated confirmation message for PENDING or PENDING_PAYMENT appointments (Awaiting Payment)
        if (appointment.status === 'PENDING' || appointment.status === 'PENDING_PAYMENT') {
            console.log(`[Event] Skipping confirmation message for ${appointment.status} appointment ${appointment.id}`);
            return;
        }

        try {
            await communicationService.sendConfirmationRequest(appointment);
            
            // Format time correctly for BRT
            const { formatInTimeZone } = require('date-fns-tz');
            const timeStr = formatInTimeZone(new Date(appointment.date), 'America/Sao_Paulo', 'HH:mm');

            // Notify Professional (Internal/Socket)
            if (appointment.professionalId) {
                await notificationController.createNotification({
                    userId: appointment.professionalId,
                    title: 'Novo Agendamento',
                    message: `Você tem um novo agendamento de ${appointment.client?.name || 'Cliente'} para as ${timeStr}.`,
                    type: 'appointment',
                    appointmentId: appointment.id
                });
            }

            // ALSO Notify Owner (if different from professional)
            if (appointment.barbershop?.ownerId && appointment.barbershop.ownerId !== appointment.professionalId) {
                await notificationController.createNotification({
                    userId: appointment.barbershop.ownerId,
                    title: 'Novo Agendamento na Unidade',
                    message: `${appointment.client?.name || 'Um cliente'} agendou com ${appointment.professional?.name || 'um profissional'} para as ${timeStr}.`,
                    type: 'appointment',
                    appointmentId: appointment.id
                });
            }
        } catch (error) {
            console.error('[Event Error] Failed to process APPOINTMENT_CREATED:', error.message);
        }
    });

    // 2. Appointment UPDATED (Status Change)
    eventBus.on('APPOINTMENT_UPDATED', async ({ appointment, oldStatus }) => {
        console.log(`[Event] APPOINTMENT_UPDATED: ${appointment.id} (${oldStatus} -> ${appointment.status})`);

        try {
            if (appointment.status === 'CANCELLED') {
                await communicationService.sendCancellationNotice(appointment);
                
                // Notify Professional (In-App)
                if (appointment.professionalId) {
                    await notificationController.createNotification({
                        userId: appointment.professionalId,
                        title: 'Agendamento Cancelado',
                        message: `O agendamento de ${appointment.client?.name || 'Cliente'} para as ${format(new Date(appointment.date), 'HH:mm')} foi cancelado. O horário está liberado.`,
                        type: 'cancellation',
                        appointmentId: appointment.id
                    });
                }
            } else if (appointment.status === 'CONFIRMED' && (oldStatus === 'PENDING' || oldStatus === 'PENDING_PAYMENT')) {
                // Payment was just approved (Online) or manually confirmed (Guest)
                console.log(`[Event] Appointment ${appointment.id} was PAID/APPROVED and now CONFIRMED. Sending confirmation.`);
                await communicationService.sendConfirmationRequest(appointment);
            } else if (appointment.status === 'COMPLETED') {
                await communicationService.sendThankYouMessage(appointment);
            }
        } catch (error) {
            console.error('[Event Error] Failed to process status update:', error.message);
        }
    });

    // 3. WhatsApp Message Received (Inbound Bot)
    eventBus.on('WHATSAPP_MESSAGE_RECEIVED', async (payload) => {
        try {
            await communicationService.handleIncomingMessage(payload);
        } catch (error) {
            console.error('[Event Error] Failed to process incoming WhatsApp message:', error);
        }
    });

    // 4. Appointment Reminder (Cron Job)
    eventBus.on('APPOINTMENT_REMINDER', async (appointment) => {
        try {
            await communicationService.sendAppointmentReminder(appointment);
        } catch (error) {
            console.error('[Event Error] Failed to process appointment reminder:', error);
        }
    });
    // 5. Abandoned Cart (Cron Job)
    eventBus.on('ABANDONED_CART', async (appointment) => {
        try {
            await communicationService.sendAbandonedCartReminder(appointment);
        } catch (error) {
            console.error('[Event Error] Failed to process abandoned cart reminder:', error);
        }
    });

    // 6. Late Webhook Warning
    eventBus.on('LATE_WEBHOOK_WARNING', async (appointment) => {
        try {
            await communicationService.sendLatePaymentNoticeToBarber(appointment);
        } catch (error) {
            console.error('[Event Error] Failed to send late webhook warning:', error);
        }
    });
}
module.exports = { init };
