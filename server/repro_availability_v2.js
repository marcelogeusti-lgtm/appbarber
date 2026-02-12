const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { utcToZonedTime, zonedTimeToUtc, format } = require('date-fns-tz');
const { addMinutes, isBefore, startOfDay, endOfDay, parse } = require('date-fns');

// Mock FeatureFlagService
const FeatureFlagService = {
    isEnabled: async () => false // Disable buffer for simplicity
};

const TIMEZONE = 'America/Sao_Paulo';

async function main() {
    try {
        console.log('--- Availability Repro V2 ---');

        const shopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50'; // Marcelo Geusti
        const proId = 'c96a1303-d42c-48fc-a2a3-3bcd31a2bae2'; // Rafael Fonseca
        const targetDate = '2026-02-15'; // Sunday

        console.log(`Checking Shop: ${shopId}`);
        console.log(`Checking Pro: ${proId}`);
        console.log(`Target Date: ${targetDate}`);

        // 1. Get Service
        const service = await prisma.service.findFirst({
            where: { barbershopId: shopId, active: true }
        });

        if (!service) throw new Error('No active service found for this shop');
        console.log(`Using Service: ${service.name} (${service.duration} mins)`);

        // --- MANUALLY RUNNING CONTROLLER LOGIC ---

        const startOfDaySP = zonedTimeToUtc(`${targetDate}T00:00:00`, TIMEZONE);
        const endOfDaySP = zonedTimeToUtc(`${targetDate}T23:59:59`, TIMEZONE);
        const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
        const dayOfWeek = dateSP.getDay(); // 0 = Sunday

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

        if (!pro) {
            console.log('Pro not found via findUnique');
            return;
        }

        console.log(`Pro found. Active: ${pro.active}`);
        console.log(`Schedules found: ${pro.professionalProfile?.schedules?.length}`);

        if (pro.professionalProfile?.schedules?.length === 0) {
            console.log('NO SCHEDULE MATCHED for this day.');
            return;
        }

        const proSchedule = pro.professionalProfile.schedules[0];
        console.log(`Schedule: ${proSchedule.startTime} - ${proSchedule.endTime}`);
        if (proSchedule.isOff) {
            console.log('Schedule is marked as OFF');
            return;
        }

        // 3. Get Appointments
        const appointments = await prisma.appointment.findMany({
            where: {
                barbershopId: shopId,
                professionalId: proId,
                date: {
                    gte: startOfDaySP,
                    lte: endOfDaySP
                },
                status: { not: 'CANCELLED' }
            }
        });

        console.log(`Existing Appointments: ${appointments.length}`);

        // 4. Calculate Slots
        const slots = [];
        const createTimeSP = (timeStr) => zonedTimeToUtc(`${targetDate}T${timeStr}:00`, TIMEZONE);

        const workStart = createTimeSP(proSchedule.startTime);
        const workEnd = createTimeSP(proSchedule.endTime);

        let breakStart = null;
        let breakEnd = null;
        if (proSchedule.breakStart && proSchedule.breakEnd) {
            breakStart = createTimeSP(proSchedule.breakStart);
            breakEnd = createTimeSP(proSchedule.breakEnd);
        }

        let currentSlot = workStart;
        const stepMinutes = 30; // Assuming standard interval
        const totalDuration = service.duration;

        while (currentSlot < workEnd) {
            const potentialEnd = addMinutes(currentSlot, totalDuration);

            // 1. Must finish before work ends
            if (potentialEnd > workEnd) {
                // console.log(`Slot ${format(currentSlot, 'HH:mm')} skipped: ends after work`);
                currentSlot = addMinutes(currentSlot, stepMinutes);
                continue;
            }

            // 2. Must not overlap break
            if (breakStart && breakEnd) {
                if (currentSlot < breakEnd && potentialEnd > breakStart) {
                    // console.log(`Slot ${format(currentSlot, 'HH:mm')} skipped: match break`);
                    currentSlot = addMinutes(currentSlot, stepMinutes);
                    continue;
                }
            }

            // 3. Occupied?
            const isOccupied = appointments.some(app => {
                const appStart = new Date(app.date);
                const appEnd = addMinutes(appStart, 30); // simplistic duration
                return (currentSlot < appEnd && potentialEnd > appStart);
            });

            if (!isOccupied) {
                const zonedSlot = utcToZonedTime(currentSlot, TIMEZONE);
                slots.push(format(zonedSlot, 'HH:mm'));
            }

            currentSlot = addMinutes(currentSlot, stepMinutes);
        }

        console.log(`\nAvailable Slots (${slots.length}):`);
        console.log(slots.join(', '));

    } catch (error) {
        console.error('FAILURE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
