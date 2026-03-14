const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listAllToday() {
    try {
        const today = new Date('2026-03-14T00:00:00Z');
        const tomorrow = new Date('2026-03-15T00:00:00Z');

        const clients = await prisma.client.findMany({
            where: {
                createdAt: { gte: today, lt: tomorrow }
            },
            select: { name: true, phone: true }
        });

        console.log(JSON.stringify(clients, null, 2));
    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
listAllToday();
