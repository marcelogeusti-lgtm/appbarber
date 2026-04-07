const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function listAllMarceloAppointments() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; };

    try {
        const clientIds = ['9e464e88-b1d5-4bad-8a4c-793838904ead'];
        const apps = await prisma.appointment.findMany({
            where: { clientId: { in: clientIds } },
            select: { id: true, date: true, status: true, barbershop: { select: { name: true } } },
            orderBy: { date: 'desc' }
        });

        log(`Marcelo has ${apps.length} appointments.`);
        apps.forEach(a => {
            log(`ID: ${a.id} | Date: ${a.date.toISOString()} | Status: ${a.status} | Shop: ${a.barbershop?.name}`);
        });

        fs.writeFileSync('apps_marcelo_utf8.txt', output, 'utf8');
        console.log('Done');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listAllMarceloAppointments();
