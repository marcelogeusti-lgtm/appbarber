const prisma = require('./src/lib/prisma');

async function findMarceloClient() {
    console.log('Searching for Client connected to marcelogeusti@gmail.com...');
    const client = await prisma.client.findFirst({
        where: { authUser: { email: 'marcelogeusti@gmail.com' } }
    });
    console.log(JSON.stringify(client, null, 2));
}

findMarceloClient().finally(() => prisma.$disconnect());
