const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findMarcelo() {
    try {
        const users = await prisma.authUser.findMany({
            where: { email: { contains: 'marcelo', mode: 'insensitive' } },
            include: { client: true, user: true }
        });
        console.log('--- MARCELO ACCOUNTS ---');
        users.forEach(u => {
            console.log(`ID: ${u.id} | Email: ${u.email} | ClientID: ${u.client?.id || 'NONE'} | UserID: ${u.user?.id || 'NONE'}`);
        });

        // Also check if there are clients with name Marcelo but different Auth
        const clients = await prisma.client.findMany({
            where: { name: { contains: 'marcelo', mode: 'insensitive' } },
            include: { authUser: true }
        });
        console.log('\n--- MARCELO CLIENT PROFILES ---');
        clients.forEach(c => {
            console.log(`ID: ${c.id} | Name: ${c.name} | authUID: ${c.authUserId} | AuthEmail: ${c.authUser?.email || 'NONE'}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findMarcelo();
