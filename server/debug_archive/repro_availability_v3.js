const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { utcToZonedTime, zonedTimeToUtc, format } = require('date-fns-tz');
const { addMinutes, addDays, isBefore } = require('date-fns');

const TIMEZONE = 'America/Sao_Paulo';

async function main() {
    try {
        console.log('--- Availability Repro V3 (Monday) ---');

        const shopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50'; // Marcelo Geusti
        const proId = 'c96a1303-d42c-48fc-a2a3-3bcd31a2bae2'; // Rafael Fonseca
        const targetDate = '2026-02-17'; // Tuesday (Just to be safe, Day 2)
        // Wait, Repro output said Day 1 (Mon) is 09:00 - 01:00.
        // Let's use 2026-02-16 (Monday).

        console.log(`Target Date: ${targetDate}`);

        const startOfDaySP = zonedTimeToUtc(`${targetDate}T00:00:00`, TIMEZONE);
        const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
        const dayOfWeek = dateSP.getDay();

        console.log(`Day of Week (SP): ${dayOfWeek}`);

        // 2. Get Professional with Schedule
        const pro = await prisma.user.findUnique({
            where: { id: proId },
            include: {
                professionalProfile: {
                    include: {
                        schedules: {
                            where: { dayOfWeek: dayOfWeek }
                        }
                    }
                }
            }
        });

        if (!pro || !pro.professionalProfile.schedules[0]) {
            console.log('No schedule found.');
            return;
        }

        const proSchedule = pro.professionalProfile.schedules[0];
        console.log(`Schedule: ${proSchedule.startTime} - ${proSchedule.endTime}`);

        // REPLICATING CONTROLLER LOGIC EXACTLY
        const createTimeSP = (timeStr) => zonedTimeToUtc(`${targetDate}T${timeStr}:00`, TIMEZONE);

        const workStart = createTimeSP(proSchedule.startTime);
        let workEnd = createTimeSP(proSchedule.endTime);

        console.log(`Work Start (UTC): ${workStart.toISOString()}`);
        console.log(`Work End (UTC):   ${workEnd.toISOString()}`);

        if (workEnd <= workStart) {
            console.log('Overnight shift detected. Adding 1 day to Work End.');
            workEnd = addDays(workEnd, 1);
        }

        let currentSlot = workStart;
        const stepMinutes = 30;
        let count = 0;

        while (currentSlot < workEnd) {
            count++;
            currentSlot = addMinutes(currentSlot, stepMinutes);
        }
        console.log(`Slots calculated: ${count}`);

    } catch (error) {
        console.error('FAILURE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
