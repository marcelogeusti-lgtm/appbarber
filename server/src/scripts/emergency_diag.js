const prisma = require('../lib/prisma');

async function run() {
    try {
        const shopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
        const apps = await prisma.appointment.findMany({
            where: {
                barbershopId: shopId,
                date: {
                    gte: new Date('2026-03-01T00:00:00Z'),
                    lte: new Date('2026-03-31T23:59:59Z')
                }
            },
            select: { id: true, date: true, status: true }
        });

        console.log(`Appointments for NextApp in March 2026 (${apps.length}):`);
        apps.forEach(app => {
            console.log(`${app.id}: ${app.date.toISOString()} | ${app.status}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
run();
