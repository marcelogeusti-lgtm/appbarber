const cron = require('node-cron');
const prisma = require('./lib/prisma');
const notificationController = require('./controllers/notification.controller');
const communicationService = require('./services/communication/CommunicationService');
const autoCloseJob = require('./services/jobs/autoCloseJob');

// ... existing code ...

const initReminderScheduler = () => {
    console.log('[Scheduler] Appointment Reminder Service Started.');
    const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');
    const TIMEZONE = 'America/Sao_Paulo';

    // Job de Baixa Automática (Roda a cada hora)
    cron.schedule('0 * * * *', () => {
        autoCloseJob();
    });

    cron.schedule('* * * * *', async () => {
        try {
            const nowUTC = new Date();
            // We usually compare UTC database times with "nowUTC". All good.
            // But if we want to print logs in local time or do logic based on "Is it 8 AM in SP?", we need conversion.
            // For simple "24h before" or "30m before", pure UTC math (diff) is fine because 1 hour is 1 hour everywhere.
            // So: `date: { gt: now }` works if DB is UTC and now is UTC.

            // --- 1. EXISTING: Client Reminders (Whatsapp/Email) ---
            const pendingReminders = await prisma.appointment.findMany({
                where: {
                    reminderMinutes: { not: null },
                    reminderSent: false,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    date: { gt: nowUTC } // Only future appointments
                },
                include: { client: true, service: true, barbershop: true }
            });

            for (const appointment of pendingReminders) {
                const appointmentTime = new Date(appointment.date).getTime();
                const reminderTime = appointmentTime - (appointment.reminderMinutes * 60 * 1000);

                // If NOW is past the reminder trigger time
                if (nowUTC.getTime() >= reminderTime) {
                    try {
                        await communicationService.sendAppointmentReminder(appointment);
                        await prisma.appointment.update({
                            where: { id: appointment.id },
                            data: { reminderSent: true }
                        });
                        console.log(`[Scheduler] Reminder sent for #${appointment.id}`);
                    } catch (err) {
                        console.error(`[Scheduler] Failed to send reminder for #${appointment.id}: ${err.message}`);
                    }
                }
            }

            // --- 2. NEW: "Get Ready" Alert for Professionals (30 min before) ---
            const upcomingAppointments = await prisma.appointment.findMany({
                where: {
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    date: {
                        gte: new Date(nowUTC.getTime() + 29 * 60000), // Now + 29m
                        lte: new Date(nowUTC.getTime() + 31 * 60000)  // Now + 31m
                    }
                },
                include: { client: true, service: true }
            });

            for (const apt of upcomingAppointments) {
                await notificationController.createNotification({
                    userId: apt.professionalId,
                    title: '⏰ Próximo Cliente em 30min',
                    message: `${apt.client?.name || apt.guestName || 'Cliente'} para ${apt.service?.name}. Prepare sua bancada!`,
                    type: 'system',
                    appointmentId: apt.id
                });
            }

            // --- 3. NEW: "No-Show" Check (15 min after Start) ---
            const lateAppointments = await prisma.appointment.findMany({
                where: {
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    date: {
                        gte: new Date(nowUTC.getTime() - 20 * 60000), // Started 20 mins ago
                        lte: new Date(nowUTC.getTime() - 15 * 60000)  // Started 15 mins ago
                    }
                },
                include: { client: true }
            });

            for (const apt of lateAppointments) {
                await notificationController.createNotification({
                    userId: apt.professionalId,
                    title: '🤔 O cliente compareceu?',
                    message: `O agendamento de ${apt.client?.name || apt.guestName} passou do horário. Finalize ou marque No-Show.`,
                    type: 'system',
                    appointmentId: apt.id
                });
            }

        } catch (error) {
            console.error('[Scheduler] Critical error:', error);
        }
    });
};

module.exports = { initReminderScheduler };
