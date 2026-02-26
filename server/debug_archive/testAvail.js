const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addMinutes, format } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

const TIMEZONE = 'America/Sao_Paulo';

async function testAvailability() {
    const barbershopId = '8b3fcfd4-309c-4e24-9004-e03492986be4';
    const date = '2026-01-23';
    const serviceIds = '3691776c-6f8e-47e1-be14-332ee1d28a4e';

    const servicesList = await prisma.service.findMany({
        where: { id: { in: serviceIds.split(',') } }
    });
    const totalDuration = servicesList.reduce((acc, curr) => acc + curr.duration, 0);

    const startOfDaySP = zonedTimeToUtc(`${date}T00:00:00`, TIMEZONE);
    const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
    const dayOfWeek = dateSP.getDay();

    const pros = await prisma.user.findMany({
        where: {
            OR: [
                { ownedBarbershops: { some: { id: barbershopId } } },
                { workedBarbershopId: barbershopId }
            ],
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

    const appointments = await prisma.appointment.findMany({
        where: { barbershopId, date: { gte: startOfDaySP, lte: zonedTimeToUtc(`${date}T23:59:59`, TIMEZONE) }, status: { not: 'CANCELLED' } },
        include: { service: true }
    });

    for (const pro of pros) {
        const proSchedule = pro.professionalProfile?.schedules[0];
        if (!proSchedule) { console.log(`No schedule for ${pro.name}`); continue; }

        const createTimeSP = (t) => zonedTimeToUtc(`${date}T${t}:00`, TIMEZONE);
        const workStart = createTimeSP(proSchedule.startTime);
        const workEnd = createTimeSP(proSchedule.endTime);

        let currentSlot = workStart;
        const slots = [];
        while (currentSlot < workEnd) {
            const potentialEnd = addMinutes(currentSlot, totalDuration);
            if (potentialEnd > workEnd) break;

            const isOccupied = appointments.some(app => {
                if (app.professionalId !== pro.id) return false;
                const appStart = new Date(app.date);
                const appEnd = addMinutes(appStart, app.service?.duration || 30);
                return (currentSlot < appEnd && potentialEnd > appStart);
            });

            if (!isOccupied) {
                slots.push(format(utcToZonedTime(currentSlot, TIMEZONE), 'HH:mm'));
            }
            currentSlot = addMinutes(currentSlot, 30);
        }
        console.log(`- Pro: ${pro.name}, Slots Found: ${slots.length}`);
        if (slots.length > 0) console.log(`  First Slot: ${slots[0]}, Last Slot: ${slots[slots.length - 1]}`);
    }
}

testAvailability().catch(console.error).finally(() => prisma.$disconnect());
