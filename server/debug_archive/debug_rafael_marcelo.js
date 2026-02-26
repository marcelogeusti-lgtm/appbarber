const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { utcToZonedTime, zonedTimeToUtc } = require('date-fns-tz');

async function main() {
    try {
        const targetDate = '2026-02-13'; // Friday
        const TIMEZONE = 'America/Sao_Paulo';
        const startOfDaySP = zonedTimeToUtc(`${targetDate}T00:00:00`, TIMEZONE);
        const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
        const dayOfWeek = dateSP.getDay();

        const shopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
        const rafaelId = 'c96a1303-d42c-48fc-a2a3-3bcd31a2bae2';

        console.log(`--- Debugging Rafael (${rafaelId}) in ${shopId} ---`);
        console.log(`Target Date: ${targetDate}, Day of Week: ${dayOfWeek}`);

        const pro = await prisma.user.findUnique({
            where: { id: rafaelId },
            include: {
                professionalProfile: {
                    include: {
                        schedules: {
                            where: { dayOfWeek, isOff: false }
                        }
                    }
                }
            }
        });

        if (!pro) {
            console.log('Professional not found');
            return;
        }

        console.log(`Pro: ${pro.name}, Active: ${pro.active}`);
        console.log(`Schedule:`, JSON.stringify(pro.professionalProfile?.schedules, null, 2));

        const appointments = await prisma.appointment.findMany({
            where: {
                professionalId: rafaelId,
                date: {
                    gte: startOfDaySP,
                    lte: zonedTimeToUtc(`${targetDate}T23:59:59`, TIMEZONE)
                },
                status: { not: 'CANCELLED' }
            }
        });
        console.log(`Appointments: ${appointments.length}`);

        // Simulate slot generation
        const proSchedule = pro.professionalProfile?.schedules[0];
        if (!proSchedule) {
            console.log('No schedule found for this day.');
        } else {
            console.log(`Time range: ${proSchedule.startTime} - ${proSchedule.endTime}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
