const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findTestData() {
    try {
        const barbershop = await prisma.barbershop.findFirst({
            include: { services: true }
        });

        if (!barbershop) {
            console.log('No barbershop found');
            return;
        }

        const appointment = await prisma.appointment.findFirst({
            where: { barbershopId: barbershop.id },
            include: { service: true }
        });

        console.log('TEST_DATA_START');
        console.log(JSON.stringify({
            barbershopId: barbershop.id,
            barbershopName: barbershop.name,
            serviceId: barbershop.services[0]?.id,
            appointmentId: appointment?.id
        }, null, 2));
        console.log('TEST_DATA_END');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findTestData();
