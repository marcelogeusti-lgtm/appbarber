const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const shops = await prisma.barbershop.findMany({
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        subscriptionStatus: true,
        city: true,
        createdAt: true
      }
    });
    
    const appointments = await prisma.appointment.groupBy({
      by: ['barbershopId'],
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      _count: { id: true }
    });

    console.log('--- SHOPS DATA ---');
    console.log(JSON.stringify(shops, null, 2));
    console.log('--- TRENDING DATA (7d) ---');
    console.log(JSON.stringify(appointments, null, 2));

  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
