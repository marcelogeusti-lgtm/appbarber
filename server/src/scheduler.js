const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const communicationService = require('./services/communication/CommunicationService');

/**
 * Scheduler to handle automated appointment reminders
 * Runs every minute to check which reminders need to be sent
 */
const initReminderScheduler = () => {
    console.log('[Scheduler] Appointment Reminder Service Started.');

    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // Find appointments that:
            // 1. Have a reminderMinutes set
            // 2. Haven't had a reminder sent yet
            // 3. Are not cancelled
            // 4. The scheduled time minus reminderMinutes is <= now
            // 5. The appointment hasn't passed yet (optional but good practice)

            const pendingReminders = await prisma.appointment.findMany({
                where: {
                    reminderMinutes: { not: null },
                    reminderSent: false,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    date: {
                        gt: now // Only future appointments
                    }
                },
                include: {
                    client: true,
                    service: true,
                    professional: true,
                    barbershop: true
                }
            });

            for (const appointment of pendingReminders) {
                const appointmentTime = new Date(appointment.date).getTime();
                const reminderTime = appointmentTime - (appointment.reminderMinutes * 60 * 1000);

                if (now.getTime() >= reminderTime) {
                    console.log(`[Scheduler] Sending reminder for appointment ${appointment.id} to ${appointment.client.name}`);

                    try {
                        // We'll use a new method in CommunicationService or reuse existing logic
                        // For now, let's assume sendReminder exists or we'll add it
                        await communicationService.sendAppointmentReminder(appointment);

                        // Mark as sent
                        await prisma.appointment.update({
                            where: { id: appointment.id },
                            data: { reminderSent: true }
                        });

                        console.log(`[Scheduler] Reminder sent successfully for ${appointment.id}`);
                    } catch (sendError) {
                        console.error(`[Scheduler] Error sending reminder for ${appointment.id}:`, sendError.message);
                    }
                }
            }
        } catch (error) {
            console.error('[Scheduler] Critical error in reminder job:', error);
        }
    });
};

module.exports = { initReminderScheduler };
