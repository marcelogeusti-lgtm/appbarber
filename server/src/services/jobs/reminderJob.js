const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { addMinutes, subMinutes } = require('date-fns');
const eventBus = require('../events/eventBus');

const prisma = new PrismaClient();

const initScheduler = () => {
    console.log('[Scheduler] Reminder Job initialized (Every 10 mins).');

    // Run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        console.log('[Scheduler] Checking for upcoming appointments...');

        try {
            const now = new Date();
            // Look for appointments roughly 1 hour from now (50 to 70 mins window)
            const startWindow = addMinutes(now, 50);
            const endWindow = addMinutes(now, 70);

            const appointments = await prisma.appointment.findMany({
                where: {
                    status: 'CONFIRMED',
                    reminderSent: false,
                    date: {
                        gte: startWindow,
                        lte: endWindow
                    }
                },
                include: {
                    client: true,
                    barbershop: true,
                    professional: true,
                    service: true
                }
            });

            if (appointments.length > 0) {
                console.log(`[Scheduler] Found ${appointments.length} appointments to remind.`);

                for (const app of appointments) {
                    // Emit Event
                    eventBus.emit('APPOINTMENT_REMINDER', app);

                    // Mark as sent immediately to avoid duplicates in next run
                    await prisma.appointment.update({
                        where: { id: app.id },
                        data: { reminderSent: true }
                    });
                }
            } else {
                console.log('[Scheduler] No appointments found for reminder.');
            }

        } catch (error) {
            console.error('[Scheduler] Error processing reminders:', error);
        }
    });
};

module.exports = { initScheduler };
