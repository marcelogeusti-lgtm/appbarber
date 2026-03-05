const eventBus = require('./src/services/events/eventBus');
const prisma = require('./src/lib/prisma');
require('./src/services/notificationService').init();

async function runTest() {
    console.log('Sending Test Event... APPOINTMENT_CREATED');

    // Simulate finding a client and professional
    const client = await prisma.client.findFirst({
        where: { authUser: { email: { not: '' } } },
        include: { authUser: true }
    });
    const professional = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const barbershop = await prisma.barbershop.findFirst();

    if (!client || !professional || !barbershop) {
        console.log('Missing data for test');
        return;
    }

    eventBus.emit('APPOINTMENT_CREATED', {
        id: 'test-appointment-id',
        client: {
            id: client.id,
            name: client.name,
            phone: client.phone
        },
        professionalId: professional.id,
        professional: {
            name: professional.name
        },
        barbershop: {
            id: barbershop.id,
            name: barbershop.name,
            address: barbershop.address || 'Rua Teste, 123'
        },
        service: {
            name: 'Corte e Barba'
        },
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // Tomorrow
    });

    console.log('Event emitted. Waiting 5 seconds before checking DB...');

    setTimeout(async () => {
        const logs = await prisma.emailLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1
        });
        const nots = await prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 1
        });
        console.log('LATEST EMAIL LOG:', logs);
        console.log('LATEST NOTIFICATION:', nots);
        process.exit(0);
    }, 5000);
}

runTest();
