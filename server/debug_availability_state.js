const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { utcToZonedTime, zonedTimeToUtc, format } = require('date-fns-tz');

async function main() {
    try {
        console.log('--- Deep Dive Availability ---');
        const targetDate = '2026-02-13'; // Friday
        const TIMEZONE = 'America/Sao_Paulo';
        const startOfDaySP = zonedTimeToUtc(`${targetDate}T00:00:00`, TIMEZONE);
        const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
        const dayOfWeek = dateSP.getDay(); // (0-6)

        console.log(`Target Date: ${targetDate}, Day of Week: ${dayOfWeek}`);

        // 1. Find the specific shop from the user's name or common shops
        const shop = await prisma.barbershop.findFirst({
            where: { name: { contains: 'Marcelo' } }
        });

        if (!shop) {
            console.log('Shop not found');
            return;
        }
        console.log(`Shop: ${shop.name} (${shop.id})`);

        // 2. Find Rafael Fonseca specifically
        const rafael = await prisma.user.findFirst({
            where: { name: { contains: 'Rafael Fonseca' } },
            include: {
                professionalProfile: {
                    include: {
                        schedules: {
                            where: { dayOfWeek }
                        }
                    }
                }
            }
        });

        if (!rafael) {
            console.log('Rafael Fonseca not found');
        } else {
            console.log(`\nPro: ${rafael.name} (${rafael.id})`);
            console.log(`Active: ${rafael.active}`);
            console.log(`Worked Shop ID: ${rafael.workedBarbershopId}`);
            console.log(`Schedule for Friday (Day ${dayOfWeek}):`, JSON.stringify(rafael.professionalProfile?.schedules, null, 2));

            // Check if service exists for this shop
            const services = await prisma.service.findMany({
                where: { barbershopId: rafael.workedBarbershopId, active: true }
            });
            console.log(`Available Services in Shop (${services.length}):`, services.map(s => `${s.name} (${s.id})`).join(', '));
        }

        // 3. Find if there are ANY appointments for Rafael on this day
        const appointments = await prisma.appointment.findMany({
            where: {
                professionalId: rafael?.id,
                date: {
                    gte: startOfDaySP,
                    lte: zonedTimeToUtc(`${targetDate}T23:59:59`, TIMEZONE)
                }
            }
        });
        console.log(`\nAppointments for Rafael on ${targetDate}: ${appointments.length}`);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
