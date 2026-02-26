const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { utcToZonedTime, zonedTimeToUtc, format } = require('date-fns-tz');

const TIMEZONE = 'America/Sao_Paulo';

async function main() {
    try {
        console.log('--- Availability Repro ---');

        // 1. Find a shop
        const shop = await prisma.barbershop.findFirst({
            include: { staff: true, services: true }
        });

        if (!shop) throw new Error('No Barbershop found');

        console.log(`Checking Shop: ${shop.name} (${shop.id})`);

        // 2. Define a target date (Next Monday to avoid weekend issues if they don't work)
        // Or just use tomorrow
        const targetDate = '2025-05-19'; // A Monday
        // Monday = 1
        const startOfDaySP = zonedTimeToUtc(`${targetDate}T00:00:00`, TIMEZONE);
        const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
        const dayOfWeek = dateSP.getDay();

        console.log(`Target Date: ${targetDate}`);
        console.log(`Day of Week (SP): ${dayOfWeek}`);

        // 3. Find Pros with Schedule for this day
        const pros = await prisma.user.findMany({
            where: {
                workedBarbershopId: shop.id,
                active: true,
                professionalProfile: { isNot: null }
            },
            include: {
                professionalProfile: {
                    include: {
                        schedules: {
                            where: { dayOfWeek, isOff: false } // Check if this filters correctly
                        }
                    }
                }
            }
        });

        console.log(`Found ${pros.length} active pros.`);

        for (const pro of pros) {
            console.log(`\nPro: ${pro.name} (${pro.id})`);
            const schedules = pro.professionalProfile?.schedules || [];
            console.log(`Schedules found for day ${dayOfWeek}: ${schedules.length}`);

            if (schedules.length > 0) {
                console.log('Schedule Details:', JSON.stringify(schedules[0], null, 2));
            } else {
                console.log('-> NO SCHEDULE FOUND for this day via query.');

                // Debug: duplicate check without day filter
                const allSchedules = await prisma.schedule.findMany({
                    where: { professionalId: pro.professionalProfile.id }
                });
                console.log('All Schedules for Pro:', allSchedules.map(s => `${s.dayOfWeek} (${s.startTime}-${s.endTime})`).join(', '));
            }
        }

    } catch (error) {
        console.error('FAILURE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
