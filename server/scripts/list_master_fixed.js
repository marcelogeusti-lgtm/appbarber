const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true }
    });
    console.log('--- ALL USERS ---');
    console.log(users);
    
    const shops = await prisma.barbershop.findMany({
      select: { id: true, name: true, slug: true, ownerId: true }
    });
    console.log('--- ALL SHOPS ---');
    console.log(shops);
  } catch (err) {
    console.error(err);
  }
}
run().finally(() => prisma.$disconnect());
