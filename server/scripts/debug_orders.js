const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
    const authUserId = '8a539e51-72f5-44ea-8416-da107fadf8a3';
    console.log('--- DEBUG ORDERS FOR AUTH_USER:', authUserId, '---');

    const clients = await prisma.client.findMany({
        where: { authUserId },
        select: { id: true, name: true }
    });

    const clientIds = clients.map(c => c.id);
    console.log('Client IDs:', clientIds);

    const orders = await prisma.order.findMany({
        where: { clientId: { in: clientIds } },
        include: { client: true, barbershop: { select: { name: true } } }
    });

    console.log('Total Orders Found for these Clients:', orders.length);
    orders.forEach(o => {
        console.log(`Order ID: ${o.id}, Status: ${o.status}, Shop: ${o.barbershop?.name}, Client: ${o.client?.name}, Created: ${o.createdAt}`);
    });

    // Also check for any Order in the system for a specific barbershop if bId is known
    // Let's find barbershops owned by him
    const ownedShops = await prisma.barbershop.findMany({
        where: { ownerId: '8a539e51-72f5-44ea-8416-da107fadf8a3' }, // Note: ownerId in Barbershop is User.id, not AuthUser.id? 
        // Actually schema says ownerId: String, owner: User
        // User.authUserId is linked.
    });

    console.log('--- OWNED BARBERSHOPS ---');
    const user = await prisma.user.findFirst({ where: { authUserId } });
    if (user) {
        const shops = await prisma.barbershop.findMany({ where: { ownerId: user.id } });
        shops.forEach(s => {
            console.log(`Shop: ${s.name}, ID: ${s.id}`);
        });
    }

    await prisma.$disconnect();
}

debug();
