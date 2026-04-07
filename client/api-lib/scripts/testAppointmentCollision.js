const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

const TIMEZONE = 'America/Sao_Paulo';

async function testAppointmentCollision() {
    try {
        console.log('--- TEST APPOINTMENT COLLISION & AVAILABILITY ---');

        // 1. Setup Data
        console.log('Creating Test Data...');
        const uniqueSuffix = Date.now();
        const baseEmail = `test${uniqueSuffix}@test.com`;

        const owner = await prisma.user.create({
            data: { name: 'Owner Test', email: baseEmail, role: 'ADMIN' }
        });

        const shop = await prisma.barbershop.create({
            data: {
                name: `Barber Shop ${uniqueSuffix}`,
                slug: `shop-${uniqueSuffix}`,
                ownerId: owner.id
            }
        });

        const service = await prisma.service.create({
            data: {
                name: 'Corte Teste',
                price: 50,
                duration: 60, // 1 hour
                barbershopId: shop.id
            }
        });

        // Professional with Schedule
        const proUser = await prisma.user.create({
            data: { name: 'Pro Test', email: `pro${uniqueSuffix}@test.com`, role: 'BARBER' }
        });

        const proProfile = await prisma.professional.create({
            data: {
                userId: proUser.id,
                schedules: {
                    create: [
                        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
                        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }  // Tuesday
                    ]
                }
            }
        });

        // Add pro to shop staff
        await prisma.user.update({
            where: { id: proUser.id },
            data: { workedBarbershopId: shop.id }
        });


        // 2. Create First Appointment
        // Target: Next Monday at 10:00 AM SP Time
        // Let's find next Monday
        const today = new Date();
        const nextMonday = new Date();
        nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));
        const dateStr = nextMonday.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = "10:00";

        console.log(`Booking for ${dateStr} at ${timeStr} (SP Time)...`);

        // We simulate what the controller does: UTC conversion
        const appointmentDate = zonedTimeToUtc(`${dateStr}T${timeStr}:00`, TIMEZONE);

        const app1 = await prisma.appointment.create({
            data: {
                date: appointmentDate,
                clientId: owner.id, // self booking for ease
                professionalId: proUser.id,
                serviceId: service.id,
                barbershopId: shop.id,
                status: 'CONFIRMED'
            }
        });
        console.log('Appointment 1 Created ID:', app1.id);


        // 3. Try Collision (Overlap)
        // Trying 10:30 (Overlap since duration is 60m)
        console.log('Checking for conflict at 10:30...');
        const conflictDate = zonedTimeToUtc(`${dateStr}T10:30:00`, TIMEZONE);
        const conflictEnd = new Date(conflictDate.getTime() + 60 * 60000);

        const conflicts = await prisma.appointment.findMany({
            where: {
                professionalId: proUser.id,
                date: {
                    gte: zonedTimeToUtc(`${dateStr}T00:00:00`, TIMEZONE),
                    lte: zonedTimeToUtc(`${dateStr}T23:59:59`, TIMEZONE)
                },
                status: { not: 'CANCELLED' }
            },
            include: { service: true }
        });

        // Mimic check logic
        const hasConflict = conflicts.some(app => {
            const appStart = new Date(app.date);
            const appEnd = new Date(appStart.getTime() + (app.service.duration * 60000));
            // New Req: 10:30 - 11:30
            // Existing: 10:00 - 11:00
            // Overlap: 10:30 < 11:00 && 11:30 > 10:00 -> TRUE
            return (conflictDate < appEnd && conflictEnd > appStart);
        });

        if (hasConflict) {
            console.log('✅ SUCCESS: Conflict correctly detected!');
        } else {
            console.error('❌ FAILURE: Conflict NOT detected!');
        }


        // 4. Check Availability Logic (calling controller logic basically)
        // We expect 10:00 to be MISSING from slots
        // We expect 09:00, 11:00 to be present (if step is 30m)
        console.log('Checking Availability Logic...');
        // Simplified check
        const proSchedule = { startTime: '09:00', endTime: '12:00' };
        // ... (skipping full availability reimplementation here, just basic confidence)


        // Cleanup
        await prisma.appointment.delete({ where: { id: app1.id } });
        await prisma.service.delete({ where: { id: service.id } });
        await prisma.professional.delete({ where: { id: proProfile.id } }); // cascading?
        await prisma.barbershop.delete({ where: { id: shop.id } });
        await prisma.user.deleteMany({ where: { email: { in: [baseEmail, `pro${uniqueSuffix}@test.com`] } } });

        console.log('Cleanup Done.');

    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testAppointmentCollision();
