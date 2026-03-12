const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const ownerIds = [
      'ff550352-540a-4fd4-a1a5-55cb7c61a54f',
      '58fe1ce0-2904-4b1b-9926-125639a6a568'
    ];
    
    const shops = await prisma.barbershop.findMany({
      where: {
        ownerId: { in: ownerIds }
      },
      select: { id: true, name: true, slug: true, ownerId: true }
    });
    console.log('--- TARGET SHOPS ---');
    console.log(shops);

  } catch (err) {
    console.error(err);
  }
}
run().finally(() => prisma.$disconnect());
