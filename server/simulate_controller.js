const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { utcToZonedTime, zonedTimeToUtc, format } = require('date-fns-tz');
const { addMinutes, addDays, isBefore } = require('date-fns');

const TIMEZONE = 'America/Sao_Paulo';

async function main() {
    try {
        const barbershopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
        const date = '2026-02-13'; // Friday
        const serviceIds = '0f7fd72c-4b36-41c8-b6fb-d4283eef1838'; // Corte Degradê

        console.log(`--- Controller Simulation ---`);
        console.log(`Shop: ${barbershopId}, Date: ${date}, Services: ${serviceIds}`);

        const startOfDaySP = zonedTimeToUtc(`${date}T00:00:00`, TIMEZONE);
        const endOfDaySP = zonedTimeToUtc(`${date}T23:59:59`, TIMEZONE);
        const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
        const dayOfWeek = dateSP.getDay();

        console.log(`Day Of Week (SP): ${dayOfWeek}`);

        const services = await prisma.service.findMany({
            where: { id: { in: serviceIds.split(',') } }
        });
        const totalDuration = services.reduce((acc, s) => acc + s.duration, 0);
        console.log(`Total Duration: ${totalDuration}`);

        const pros = await prisma.user.findMany({
            where: {
                workedBarbershopId: barbershopId,
                active: true,
                professionalProfile: { isNot: null }
            },
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

        console.log(`Pros found: ${pros.length}`);
        for (const p of pros) console.log(` - ${p.name} (${p.id}) | Profiles: ${p.professionalProfile ? 'Yes' : 'No'} | Schedules: ${p.professionalProfile?.schedules?.length}`);

        const appointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                date: { gte: startOfDaySP, lte: endOfDaySP },
                status: { not: 'CANCELLED' }
            }
        });
        console.log(`Appointments in shop: ${appointments.length}`);

        const availability = [];
        for (const pro of pros) {
            const slots = [];
            const proSchedule = pro.professionalProfile?.schedules[0];
            if (!proSchedule) {
                console.log(`[${pro.name}] No schedule.`);
                availability.push({ proId: pro.id, slots: [] });
                continue;
            }

            const createTimeSP = (timeStr) => zonedTimeToUtc(`${date}T${timeStr}:00`, TIMEZONE);
            const workStart = createTimeSP(proSchedule.startTime);
            let workEnd = createTimeSP(proSchedule.endTime);

            if (workEnd <= workStart) workEnd = addDays(workEnd, 1);

            let breakStart = null, breakEnd = null;
            if (proSchedule.breakStart && proSchedule.breakEnd) {
                breakStart = createTimeSP(proSchedule.breakStart);
                breakEnd = createTimeSP(proSchedule.breakEnd);
            }

            let currentSlot = workStart;
            const stepMinutes = 30;
            const now = new Date();
            const nowSP = utcToZonedTime(now, TIMEZONE);
            const isToday = format(nowSP, 'yyyy-MM-dd') === date;
            const bufferTimeUTC = addMinutes(now, 15);

            while (currentSlot < workEnd) {
                const potentialEnd = addMinutes(currentSlot, totalDuration);
                if (potentialEnd > workEnd) { currentSlot = addMinutes(currentSlot, stepMinutes); continue; }

                let overlapsBreak = false;
                if (breakStart && breakEnd && currentSlot < breakEnd && potentialEnd > breakStart) overlapsBreak = true;
                if (overlapsBreak) { currentSlot = addMinutes(currentSlot, stepMinutes); continue; }

                const isOccupied = appointments.some(app => {
                    if (app.professionalId !== pro.id) return false;
                    const appStart = new Date(app.date);
                    const appEnd = addMinutes(appStart, 30); // Simple 30m for simulation
                    return (currentSlot < appEnd && potentialEnd > appStart);
                });

                if (!isOccupied) {
                    if (isToday && currentSlot < bufferTimeUTC) { // Assuming buffer enabled for sim
                        currentSlot = addMinutes(currentSlot, stepMinutes); continue;
                    }
                    slots.push(format(utcToZonedTime(currentSlot, TIMEZONE), 'HH:mm'));
                }
                currentSlot = addMinutes(currentSlot, stepMinutes);
            }
            console.log(`[${pro.name}] Slots: ${slots.length}`);
            availability.push({ proId: pro.id, proName: pro.name, slots });
        }

        console.log('\n--- Final Result ---');
        console.log(JSON.stringify(availability, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
