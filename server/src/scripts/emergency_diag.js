const prisma = require('../lib/prisma');

async function run() {
    try {
        const today = '2026-03-13';
        const tomorrow = '2026-03-14';

        const apps = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: new Date(today),
                    lte: new Date('2026-03-15')
                }
            },
            include: {
                client: { select: { name: true } },
                barbershop: { select: { name: true } }
            }
        });

        console.log(`--- APPOINTMENTS SCHEDULED FOR ${today} - ${tomorrow} ---`);
        if (apps.length === 0) {
            console.log('No appointments found for these dates.');
        } else {
            apps.forEach(app => {
                console.log(`ID: ${app.id} | Date: ${app.date} | Status: ${app.status}`);
                console.log(`Shop: ${app.barbershop?.name} (${app.barbershopId})`);
                console.log(`Client: ${app.client?.name}`);
                console.log('-------------------');
            });
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
run();
