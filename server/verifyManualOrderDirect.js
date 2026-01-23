const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLogic() {
    console.log('Verifying Manual Order Logic via Prisma...');
    const barbershopId = '8b3fcfd4-309c-4e24-9004-e03492986be4';
    const professionalId = 'f66798e7-6fb2-4c73-ac7a-c8b45bbe40fd';
    const guestName = 'Direct Prisma Test';
    const guestPhone = '11999999999';
    const serviceIds = ['3691776c-6f8e-47e1-be14-332ee1d28a4e'];

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Guest client logic
            const phone = guestPhone.replace(/\D/g, '');
            let client = await tx.client.findUnique({ where: { phone } });
            if (!client) {
                client = await tx.client.create({
                    data: { name: guestName, phone: phone }
                });
            }

            // 2. Create Order without appointment
            const newOrder = await tx.order.create({
                data: {
                    appointmentId: null,
                    barbershopId,
                    clientId: client.id,
                    professionalId,
                    status: 'OPEN'
                }
            });

            // 3. Add services
            const services = await tx.service.findMany({
                where: { id: { in: serviceIds } }
            });

            let subtotal = 0;
            const items = services.map(s => {
                const p = Number(s.price);
                subtotal += p;
                return {
                    orderId: newOrder.id,
                    type: 'SERVICE',
                    serviceId: s.id,
                    quantity: 1,
                    unitPrice: p,
                    total: p
                };
            });

            await tx.orderItem.createMany({ data: items });
            await tx.order.update({
                where: { id: newOrder.id },
                data: { subtotal, total: subtotal }
            });

            return newOrder;
        });

        console.log('Order Created Successfully:', result.id);
        const finalOrder = await prisma.order.findUnique({
            where: { id: result.id },
            include: { items: true, client: true }
        });
        console.log('Final Order Check:', {
            hasAppointment: !!finalOrder.appointmentId,
            itemsCount: finalOrder.items.length,
            clientName: finalOrder.client.name,
            total: finalOrder.total
        });

        // Cleanup
        await prisma.orderItem.deleteMany({ where: { orderId: result.id } });
        await prisma.order.delete({ where: { id: result.id } });
        console.log('Test Order Cleaned Up.');

    } catch (err) {
        console.error('Logic Verification Failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

verifyLogic();
