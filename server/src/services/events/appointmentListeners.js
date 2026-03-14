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
        console.log(`[Event] APPOINTMENT_CREATED: ${appointment.id}`);
        try {
            await communicationService.sendConfirmationRequest(appointment);
            
            // Notify Professional (Internal/Socket)
            if (appointment.professionalId) {
                await notificationController.createNotification({
                    userId: appointment.professionalId,
                    title: 'Novo Agendamento',
                    message: `Você tem um novo agendamento de ${appointment.client?.name || 'Cliente'} para as ${format(new Date(appointment.date), 'HH:mm')}.`,
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
}

module.exports = { init };
