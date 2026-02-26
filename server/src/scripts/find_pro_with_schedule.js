const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const pros = await prisma.professional.findMany({
            where: {
                schedules: { some: {} }
            },
            include: {
                user: true,
                schedules: true
            },
            take: 1
        });

        if (pros.length > 0) {
            const pro = pros[0];
            console.log('--- PRO WITH SCHEDULE FOUND ---');
            console.log(`PRO_USER_ID: ${pro.user.id}`);
            console.log(`PRO_NAME: ${pro.user.name}`);
            console.log(`SHOP_ID: ${pro.user.workedBarbershopId}`);
            console.log('SCHEDULES:');
            pro.schedules.forEach(s => {
                console.log(`  - Day ${s.dayOfWeek}: ${s.startTime} - ${s.endTime} ${s.isOff ? '(OFF)' : ''}`);
            });

            // Find a service for this pro or their shop
            const service = await prisma.service.findFirst({
                where: { barbershopId: pro.user.workedBarbershopId, active: true }
            });

            if (service) {
                console.log(`SERVICE_ID: ${service.id}`);
                console.log(`SERVICE_NAME: ${service.name}`);
            }
        } else {
            console.log('No professional found with schedules.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
