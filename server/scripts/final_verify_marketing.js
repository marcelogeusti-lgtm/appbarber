const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
  const shop = await prisma.barbershop.findUnique({ where: { slug: 'next' } });
  if (shop) {
    const appts = await prisma.appointment.count({ where: { barbershopId: shop.id } });
    const clients = await prisma.client.count({ where: { name: { contains: '[DEMO]' } } });
    console.log(`TOTAL_APPOINTMENTS: ${appts}`);
    console.log(`REMAINING_DEMO_TAGS: ${clients}`);
  }
}
check().finally(() => prisma.$disconnect());
