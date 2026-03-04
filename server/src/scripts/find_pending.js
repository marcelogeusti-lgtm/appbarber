const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findPending() {
    try {
        const payment = await prisma.payment.findFirst({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });

        console.log('PENDING_PAYMENT_START');
        console.log(JSON.stringify(payment, null, 2));
        console.log('PENDING_PAYMENT_END');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findPending();
