const cron = require('node-cron');
const prisma = require('../../lib/prisma');
const { subDays, startOfDay, endOfDay } = require('date-fns');
const eventBus = require('../events/eventBus');

const initFollowUpScheduler = () => {
    console.log('[Scheduler] Follow-up Job initialized.');

    // 1. Daily Job at 09:00 AM (Win-back, Birthday, Package Expiry)
    cron.schedule('0 9 * * *', async () => {
        console.log('[FollowUp Scheduler] Running Daily Follow-up Job (09:00 AM)...');
        try {
            const todayStart = startOfDay(new Date());
            const todayEnd = endOfDay(new Date());

            // --- 1.1 Win-back (21 days since last appointment) ---
            const twentyOneDaysAgoStart = startOfDay(subDays(new Date(), 21));
            const twentyOneDaysAgoEnd = endOfDay(subDays(new Date(), 21));

            // We need to find clients whose LATEST completed appointment was exactly 21 days ago
            // For simplicity in a cron, we first find all completed appointments from 21 days ago
            const winbackCandidates = await prisma.appointment.findMany({
                where: {
                    status: 'COMPLETED',
                    date: { gte: twentyOneDaysAgoStart, lte: twentyOneDaysAgoEnd }
                },
                include: { client: true, barbershop: true, professional: true }
            });

            for (const app of winbackCandidates) {
                if (!app.client) continue;

                // Check if they had any newer appointment since then
                const newerAppointment = await prisma.appointment.findFirst({
                    where: {
                        clientId: app.clientId,
                        date: { gt: twentyOneDaysAgoEnd },
                        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
                    }
                });

                if (!newerAppointment) {
                    console.log(`[FollowUp] Emitting CLIENT_WINBACK for client ${app.client.name}`);
                    eventBus.emit('CLIENT_WINBACK', {
                        client: app.client,
                        barbershop: app.barbershop,
                        professional: app.professional,
                        lastAppointmentDate: app.date
                    });
                }
            }

            // --- 1.2 Birthdays ---
            // Prisma doesn't have a direct month/day query function easily across all databases,
            // but we can query clients and filter, or use raw query.
            // Using a simple JS filter if the DB is not huge, or raw query for scale.
            const currentMonth = new Date().getMonth();
            const currentDay = new Date().getDate();

            const allClientsWithBirthdate = await prisma.client.findMany({
                where: { birthDate: { not: null }, active: true }
            });

            const birthdayClients = allClientsWithBirthdate.filter(c => {
                return c.birthDate.getMonth() === currentMonth && c.birthDate.getDate() === currentDay;
            });

            for (const client of birthdayClients) {
                // Find their main barbershop (e.g. from last appointment)
                const lastApp = await prisma.appointment.findFirst({
                    where: { clientId: client.id, status: 'COMPLETED' },
                    orderBy: { date: 'desc' },
                    include: { barbershop: true }
                });

                if (lastApp && lastApp.barbershop) {
                    console.log(`[FollowUp] Emitting CLIENT_BIRTHDAY for client ${client.name}`);
                    eventBus.emit('CLIENT_BIRTHDAY', {
                        client,
                        barbershop: lastApp.barbershop
                    });
                }
            }

            // --- 1.3 Package Expiring (1 cut left) ---
            const expiringSubscriptions = await prisma.clientSubscription.findMany({
                where: {
                    status: 'ACTIVE',
                    quantityOfCuts: 1
                },
                include: { client: true, plan: { include: { barbershop: true } } }
            });

            for (const sub of expiringSubscriptions) {
                console.log(`[FollowUp] Emitting PACKAGE_EXPIRING for client ${sub.client.name}`);
                eventBus.emit('PACKAGE_EXPIRING', {
                    client: sub.client,
                    barbershop: sub.plan.barbershop,
                    subscription: sub,
                    plan: sub.plan
                });
            }

        } catch (error) {
            console.error('[FollowUp Scheduler] Error running daily jobs:', error);
        }
    });

    // 2. Hourly Job (NPS - 2 hours after COMPLETED)
    cron.schedule('0 * * * *', async () => {
        console.log('[FollowUp Scheduler] Running Hourly NPS Job...');
        try {
            const now = new Date();
            const twoHoursAgoStart = subDays(now, 0); // We want 2 hours ago
            twoHoursAgoStart.setHours(now.getHours() - 2, 0, 0, 0);
            const twoHoursAgoEnd = new Date(twoHoursAgoStart);
            twoHoursAgoEnd.setHours(twoHoursAgoStart.getHours(), 59, 59, 999);

            const npsCandidates = await prisma.appointment.findMany({
                where: {
                    status: 'COMPLETED',
                    date: { gte: twoHoursAgoStart, lte: twoHoursAgoEnd }
                },
                include: { client: true, barbershop: true, professional: true, service: true }
            });

            for (const app of npsCandidates) {
                // Check if we already asked NPS
                const alreadySent = await prisma.communicationLog.findFirst({
                    where: { appointmentId: app.id, type: 'NPS_REQUEST' }
                });

                if (!alreadySent) {
                    console.log(`[FollowUp] Emitting REQUEST_NPS for appointment ${app.id}`);
                    eventBus.emit('REQUEST_NPS', app);
                }
            }
        } catch (error) {
            console.error('[FollowUp Scheduler] Error running hourly jobs:', error);
        }
    });
};

module.exports = { initFollowUpScheduler };
