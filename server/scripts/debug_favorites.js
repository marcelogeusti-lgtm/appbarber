const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const user = await prisma.authUser.findFirst({
        where: { email: { contains: 'marcelo', mode: 'insensitive' } },
        include: { client: true }
    });

    if (!user) {
        console.log('User not found.');
        return;
    }

    console.log('--- USER DATA ---');
    console.log(JSON.stringify(user, null, 2));

    if (user.client) {
        const favorites = await prisma.favoriteBarbershop.findMany({
            where: { clientId: user.client.id },
            include: { barbershop: true }
        });
        console.log('--- FAVORITES ---');
        console.log(JSON.stringify(favorites, null, 2));

        // Check if getMyFavorites logic would find this client
        console.log('--- CHECK LOGIC ---');
        const clientByAuth = await prisma.client.findUnique({ where: { authUserId: user.id } });
        console.log('Client by authUserId:', clientByAuth ? 'FOUND' : 'NOT FOUND');
    }

  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
