const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const shop = await prisma.barbershop.findUnique({
      where: { slug: 'next' },
      include: {
        staff: { select: { id: true, name: true, email: true } },
        services: { select: { id: true, name: true, price: true } }
      }
    });
    console.log('--- NEXTAPP INFO ---');
    console.log(shop);

  } catch (err) {
    console.error(err);
  }
}
run().finally(() => prisma.$disconnect());
