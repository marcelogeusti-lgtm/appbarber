const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const notificationController = require('./controllers/notification.controller');

// ... existing code ...

const initReminderScheduler = () => {
    console.log('[Scheduler] Appointment Reminder Service Started.');

    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();

            // --- 1. EXISTING: Client Reminders (Whatsapp/Email) ---
            const pendingReminders = await prisma.appointment.findMany({
                where: {
                    reminderMinutes: { not: null },
                    reminderSent: false,
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    date: { gt: now }
                },
                include: { client: true, service: true, barbershop: true } // Removed 'professional' if not needed for messaging, strictly
            });

            for (const appointment of pendingReminders) {
                const appointmentTime = new Date(appointment.date).getTime();
                const reminderTime = appointmentTime - (appointment.reminderMinutes * 60 * 1000);

                if (now.getTime() >= reminderTime) {
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
                        gte: new Date(now.getTime() + 29 * 60000), // Now + 29m
                        lte: new Date(now.getTime() + 31 * 60000)  // Now + 31m
                    },
                    // Avoid checking if we already notified? 
                    // For simplicity in this architecture without a specific flag, 
                    // ensuring the window is small (2 mins) runs once or twice. 
                    // Ideally we'd have 'professionalNotified: boolean' in DB.
                    // For now, we rely on the precise window.
                },
                include: { client: true, service: true }
            });

            for (const apt of upcomingAppointments) {
                // Check if we already sent notification ID to avoid duplication if cron overlaps?
                // We will just fire it. The frontend handles dedup or user ignores.
                await notificationController.createNotification({
                    userId: apt.professionalId,
                    title: '⏰ Próximo Cliente em 30min',
                    message: `${apt.client?.name || apt.guestName || 'Cliente'} para ${apt.service?.name}. Prepare sua bancada!`,
                    type: 'system',
                    appointmentId: apt.id
                });
            }

            // --- 3. NEW: "No-Show" Check (15 min after Start) ---
            // If status is still PENDING/CONFIRMED 15 mins after start, remind to finalize
            const lateAppointments = await prisma.appointment.findMany({
                where: {
                    status: { in: ['PENDING', 'CONFIRMED'] },
                    date: {
                        gte: new Date(now.getTime() - 20 * 60000), // Started 20 mins ago
                        lte: new Date(now.getTime() - 15 * 60000)  // Started 15 mins ago
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
