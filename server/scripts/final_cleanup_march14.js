const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
    try {
        console.log('--- STARTING CLEANUP OF MARCH 14 DEMO DATA ---');
        
        const today = new Date('2026-03-14T00:00:00Z');
        const tomorrow = new Date('2026-03-15T00:00:00Z');

        // 1. Identify Clients
        const demoClients = await prisma.client.findMany({
            where: {
                createdAt: { gte: today, lt: tomorrow },
                OR: [
                    { name: { startsWith: 'Cliente Demo' } },
                    { name: 'Teste' }
                ]
            }
        });

        const clientIds = demoClients.map(c => c.id);
        console.log(`Identified ${clientIds.length} demo clients for removal.`);

        if (clientIds.length === 0) {
            console.log('No demo clients found. Cleanup skipped.');
            return;
        }

        // 2. Cascade Deletion (Prisma doesn't always have auto-cascade set up in all schemas)
        
        // Remove OrderItems
        const itemCount = await prisma.orderItem.deleteMany({
            where: {
                order: { clientId: { in: clientIds } }
            }
        });
        console.log(`Deleted ${itemCount.count} order items.`);

        // Remove Orders
        const orderCount = await prisma.order.deleteMany({
            where: { clientId: { in: clientIds } }
        });
        console.log(`Deleted ${orderCount.count} orders.`);

        // Remove Appointments
        const appCount = await prisma.appointment.deleteMany({
            where: { clientId: { in: clientIds } }
        });
        console.log(`Deleted ${appCount.count} appointments.`);

        // Remove Notifications
        const notifCount = await prisma.notification.deleteMany({
            where: { clientId: { in: clientIds } }
        });
        console.log(`Deleted ${notifCount.count} notifications.`);

        // Remove Clients
        const finalCount = await prisma.client.deleteMany({
            where: { id: { in: clientIds } }
        });
        console.log(`Successfully removed ${finalCount.count} demo clients.`);

        console.log('--- CLEANUP COMPLETE ---');

    } catch (e) {
        console.error('Cleanup failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
