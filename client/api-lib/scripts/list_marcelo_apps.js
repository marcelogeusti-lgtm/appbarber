const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllMarceloAppointments() {
    try {
        const clientIds = ['9e464e88-b1d5-4bad-8a4c-793838904ead'];
        const apps = await prisma.appointment.findMany({
            where: { clientId: { in: clientIds } },
            select: { id: true, date: true, status: true, barbershop: { select: { name: true } } },
            orderBy: { date: 'desc' }
        });

        console.log(`Marcelo has ${apps.length} appointments.`);
        apps.forEach(a => {
            console.log(`ID: ${a.id} | Date: ${a.date.toISOString()} | Status: ${a.status} | Shop: ${a.barbershop?.name}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listAllMarceloAppointments();
