const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const clients = await prisma.client.findMany({
      where: {
        name: { contains: '[DEMO]' }
      }
    });

    console.log(`Found ${clients.length} clients to rename.`);

    for (const client of clients) {
      const newName = client.name.replace(' [DEMO]', '').replace('[DEMO]', '').trim();
      await prisma.client.update({
        where: { id: client.id },
        data: { name: newName }
      });
    }

    console.log('Renaming completed successfully!');
  } catch (err) {
    console.error('Error during renaming:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
