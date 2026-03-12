const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const users = await prisma.user.findMany({ 
      where: { role: 'OWNER' },
      select: { id: true, email: true, name: true } 
    });
    console.log('OWNERS:');
    console.log(users);
    
    const shops = await prisma.barbershop.findMany({
      select: { id: true, name: true, slug: true, ownerId: true }
    });
    console.log('SHOPS:');
    console.log(shops);
  } catch (err) {
    console.error(err);
  }
}
run().finally(() => prisma.$disconnect());
