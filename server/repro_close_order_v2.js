const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TransactionService = require('./src/services/TransactionService');

async function main() {
    try {
        console.log('--- Order Close Repro V2 ---');

        // 1. Fetch valid IDs
        const shops = await prisma.barbershop.findMany({
            include: { staff: true, services: true },
            take: 20
        });

        console.log(`Found ${shops.length} shops.`);

        const shop = shops.find(s => s.staff.length > 0 && s.services.length > 0);

        if (!shop) {
            console.log('Shops found (first 5 details):');
            shops.slice(0, 5).forEach(s => console.log(`- ${s.name}: Staff=${s.staff.length}, Services=${s.services.length}`));
            throw new Error('No Barbershop with Staff/Services found');
        }

        const pro = shop.staff[0];
        const service = shop.services[0];

        let client = await prisma.client.findFirst();
        if (!client) {
            console.log('No client found, creating one...');
            client = await prisma.client.create({
                data: {
                    name: 'Test Client',
                    phone: '99999999999'
                }
            });
        }

        console.log(`Using Shop: ${shop.name} (${shop.id})`);
        console.log(`Using Pro: ${pro.name} (${pro.id})`);
        console.log(`Using Service: ${service.name} (${service.id})`);
        console.log(`Using Client: ${client.name} (${client.id})`);

        // 2. Create Order
        const order = await prisma.order.create({
            data: {
                barbershopId: shop.id,
                professionalId: pro.id,
                clientId: client.id,
                status: 'OPEN',
                subtotal: Number(service.price),
                total: Number(service.price),
                items: {
                    create: {
                        type: 'SERVICE',
                        serviceId: service.id,
                        quantity: 1,
                        unitPrice: Number(service.price),
                        total: Number(service.price)
                    }
                }
            }
        });
        console.log(`Order Created: ${order.id}`);

        // 3. Try Close Order via TransactionService (simulating controller logic)
        console.log('Attempting to Close Order...');

        // Using $transaction as in controller
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await TransactionService.createTransaction({
                barbershopId: shop.id,
                amount: Number(order.total),
                method: 'PIX',
                origin: 'PRESENCIAL',
                orderId: order.id,
                professionalId: pro.id,
                description: `Repro Close Order #${order.id.slice(0, 8)}`
            }, tx);

            return transaction;
        });

        console.log('SUCCESS: Transaction Created:', result.id);

        // Verification
        const refreshedOrder = await prisma.order.findUnique({ where: { id: order.id } });
        console.log('Order Status:', refreshedOrder.status);
        console.log('Order PaymentMethod:', refreshedOrder.paymentMethod);

    } catch (error) {
        console.error('FAILURE:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
