const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { utcToZonedTime, format } = require('date-fns-tz');
const { addMinutes, isBefore, startOfDay, endOfDay, parse } = require('date-fns');
const FeatureFlagService = require('../services/FeatureFlagService');

const TIMEZONE = 'America/Sao_Paulo';

async function debugAvailability() {
    const barbershopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
    const dateInput = format(utcToZonedTime(new Date(), TIMEZONE), 'yyyy-MM-dd'); // Today

    console.log('--- DEBUG START ---');
    console.log('Date Input:', dateInput);

    try {
        const flag = await FeatureFlagService.isEnabled('booking_buffer', barbershopId);
        console.log('Feature Flag "booking_buffer":', flag);

        const barbershop = await prisma.barbershop.findUnique({
            where: { id: barbershopId },
            include: {
                professionals: {
                    include: {
                        professionalProfile: {
                            include: {
                                schedules: true
                            }
                        }
                    }
                }
            }
        });

        const nowSP = utcToZonedTime(new Date(), TIMEZONE);
        const bufferTime = addMinutes(nowSP, 15);
        console.log('Now SP:', format(nowSP, 'HH:mm:ss'));
        console.log('Buffer Time (Now + 15):', format(bufferTime, 'HH:mm:ss'));

        // Mocking a simplified version of the logic to see what's happening
        const testTimes = ['09:00', '10:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

        console.log('\nTesting slots for today:');
        testTimes.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const slotDate = new Date(nowSP);
            slotDate.setHours(hours, minutes, 0, 0);

            const isPast = isBefore(slotDate, bufferTime);
            console.log(`Slot ${time}: ${isPast ? 'HIDDEN (Past/Buffer)' : 'VISIBLE'}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debugAvailability();
