const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const marceloShops = await prisma.barbershop.findMany({
      where: {
        OR: [
          { name: { contains: 'Marcelo', mode: 'insensitive' } },
          { slug: { contains: 'marcelo', mode: 'insensitive' } }
        ]
      },
      select: { id: true, name: true, slug: true, ownerId: true }
    });
    console.log('--- MARCELO SHOPS ---');
    console.log(marceloShops);
    
    const relevantUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: 'Marcelo', mode: 'insensitive' } },
          { email: { contains: 'marcelo', mode: 'insensitive' } },
          { email: 'owner@barber.com' }
        ]
      },
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('--- RELEVANT USERS ---');
    console.log(relevantUsers);

  } catch (err) {
    console.error(err);
  }
}
run().finally(() => prisma.$disconnect());
