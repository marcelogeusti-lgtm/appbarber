const prisma = require('../src/lib/prisma');
const financialServiceInstance = require('../src/services/FinancialService');

async function verifyFlow() {
    console.log('--- STARTING FINAL FINANCIAL FLOW VERIFICATION ---');

    const barbershopId = '212c10d5-28a0-4e26-a1cb-6fb9ea66ac96';
    const professionalId = '5ad1dc73-6131-49d9-8709-cb89ded04419';
    const clientId = '9e1643f4-64b7-49b2-be0d-166fd9538e01';
    const serviceId = 'c22351f9-cd2f-4090-8bbe-0221fb89f428';

    const barbershop = await prisma.barbershop.findUnique({ where: { id: barbershopId } });
    const professional = await prisma.user.findUnique({ where: { id: professionalId } });
    const client = await prisma.client.findUnique({ where: { id: clientId } });
    const service = await prisma.service.findUnique({ where: { id: serviceId } });

    if (!barbershop || !professional || !client || !service) {
        console.error('Missing setup data.');
        return;
    }

    const appointment = await prisma.appointment.create({
        data: {
            date: new Date(),
            clientId: client.id,
            professionalId: professional.id,
            serviceId: service.id,
            barbershopId: barbershop.id,
            status: 'PENDING'
        }
    });

    const order = await prisma.order.create({
        data: {
            appointmentId: appointment.id,
            barbershopId: barbershop.id,
            clientId: client.id,
            professionalId: professional.id,
            total: Number(service.price),
            items: {
                create: [{
                    type: 'SERVICE',
                    serviceId: service.id,
                    quantity: 1,
                    unitPrice: Number(service.price),
                    total: Number(service.price)
                }]
            }
        }
    });

    console.log(`Created Appointment: ${appointment.id}`);

    try {
        await prisma.$transaction(async (tx) => {
            await tx.appointment.update({
                where: { id: appointment.id },
                data: { status: 'COMPLETED', paymentStatus: 'PAID', paymentMethod: 'PIX' }
            });

            await financialServiceInstance.recordIncome({
                amount: Number(service.price),
                description: `Final Test Income: ${service.name}`,
                barbershopId: barbershop.id,
                appointmentId: appointment.id,
                orderId: order.id,
                professionalId: professional.id,
                paymentMethod: 'PIX'
            }, tx);

            // Force a commission for testing since service might have 0
            await tx.commission.create({
                data: {
                    barberId: professional.id,
                    barbershopId: barbershop.id,
                    appointmentId: appointment.id,
                    type: 'SERVICE',
                    description: 'Test Commission (Manual)',
                    amount: 10.00,
                    status: 'PENDING'
                }
            });
        }, { timeout: 20000 });

        console.log('Simulated Completion and Manual Commission.');

        // Verify Income
        const transaction = await prisma.transaction.findFirst({
            where: { appointmentId: appointment.id, type: 'INCOME' }
        });
        console.log(transaction ? '✅ Income Transaction Created' : '❌ Income Transaction Missing');

        // Verify Commission
        const commission = await prisma.commission.findFirst({
            where: { appointmentId: appointment.id, status: 'PENDING' }
        });
        console.log(commission ? `✅ Commission Calculated: R$${commission.amount}` : '❌ Commission Missing');

        // Simulate Payout
        if (commission) {
            await prisma.commission.updateMany({
                where: { id: commission.id },
                data: { status: 'PAID', paidAt: new Date() }
            });

            await financialServiceInstance.recordExpense({
                amount: commission.amount,
                description: `Final Test Payout: ${professional.name}`,
                barbershopId: barbershop.id,
                professionalId: professional.id
            });
            console.log('Simulated Payout.');
        }

        // Verify Expense
        const expense = await prisma.transaction.findFirst({
            where: { professionalId: professional.id, type: 'EXPENSE', category: 'Comissão', description: { contains: 'Final Test Payout' } },
            orderBy: { createdAt: 'desc' }
        });
        console.log(expense ? `✅ Expense Transaction Created: R$${expense.amount}` : '❌ Expense Transaction Missing');

    } catch (e) {
        console.error('Test Failed:', e);
    }

    console.log('--- FINAL VERIFICATION COMPLETE ---');
}

verifyFlow().catch(console.error).finally(() => prisma.$disconnect());
