const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateHistory() {
    console.log('Starting Financial History Migration...');

    try {
        // 1. Fetch Closed/Paid Orders that don't have a transaction yet
        // We can check if there's a Transaction with this orderId
        // Ideally we fetch all orders and check one by one or use a "not exists" query if using raw SQL, 
        // but via Prisma we can just fetch and check.
        // Optimization: Fetch all orders, fetch all transaction orderIds, diff them.

        const totalOrders = await prisma.order.count();
        console.log(`Total Orders in DB: ${totalOrders}`);

        // Debug Statuses
        const statusBreakdown = await prisma.order.groupBy({
            by: ['status'],
            _count: { id: true }
        });
        console.log('Status Breakdown:', statusBreakdown);

        const paymentStatusBreakdown = await prisma.order.groupBy({
            by: ['paymentStatus'],
            _count: { id: true }
        });
        console.log('Payment Status Breakdown:', paymentStatusBreakdown);

        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { status: 'CLOSED' },
                    { paymentStatus: 'PAID' }
                ]
            },
            include: {
                items: { include: { service: true } },
                client: true,
                professional: true
            }
        });

        console.log(`Found ${orders.length} closed orders. Checking for missing transactions...`);

        let createdCount = 0;

        for (const order of orders) {
            // Check if transaction exists
            const exists = await prisma.transaction.findFirst({
                where: { orderId: order.id, type: 'INCOME' }
            });

            if (!exists) {
                // Create Transaction
                await prisma.transaction.create({
                    data: {
                        barbershopId: order.barbershopId,
                        orderId: order.id,
                        appointmentId: order.appointmentId,
                        professionalId: order.professionalId,
                        clientName: order.client?.name || 'Cliente',
                        amount: order.total,
                        type: 'INCOME',
                        category: 'Serviço', // Default
                        description: `Importado - Comanda #${order.id.substring(0, 8)}`,
                        date: order.paidAt || order.updatedAt, // Use payment date
                        paymentMethod: order.paymentMethod || 'UNKNOWN',
                        origin: 'PRESENCIAL', // Assume old ones were presencial/manual
                    }
                });
                createdCount++;
                if (createdCount % 50 === 0) console.log(`Migrated ${createdCount} orders...`);
            }
        }

        console.log(`Migration Complete. Created ${createdCount} new transaction records.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateHistory();
