const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function findMarcelo() {
    let output = '';
    const log = (msg) => { output += msg + '\n'; };

    try {
        const users = await prisma.authUser.findMany({
            where: { email: { contains: 'marcelo', mode: 'insensitive' } },
            include: { client: true, user: true }
        });
        log('--- MARCELO ACCOUNTS ---');
        users.forEach(u => {
            log(`ID: ${u.id} | Email: ${u.email} | ClientID: ${u.client?.id || 'NONE'} | UserID: ${u.user?.id || 'NONE'}`);
        });

        const clients = await prisma.client.findMany({
            where: { name: { contains: 'marcelo', mode: 'insensitive' } },
            include: { authUser: true }
        });
        log('\n--- MARCELO CLIENT PROFILES ---');
        clients.forEach(c => {
            log(`ID: ${c.id} | Name: ${c.name} | authUID: ${c.authUserId} | AuthEmail: ${c.authUser?.email || 'NONE'}`);
        });

        fs.writeFileSync('marcelo_lookup_v2.txt', output, 'utf8');
        console.log('Done');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findMarcelo();
