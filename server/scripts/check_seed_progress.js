const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function check() {
    const shop = await prisma.barbershop.findUnique({ where: { slug: 'next-demo-marketing' } });
    if (!shop) {
        console.log('Shop not found');
        return;
    }
    const appts = await prisma.appointment.count({ where: { barbershopId: shop.id } });
    const comms = await prisma.commission.count({ where: { barbershopId: shop.id } });
    const txns = await prisma.transaction.count({ where: { barbershopId: shop.id } });
    console.log(`Metrics for NEXT-DEMO:`);
    console.log(`- Appointments: ${appts}`);
    console.log(`- Commissions: ${comms}`);
    console.log(`- Transactions: ${txns}`);
}
check().finally(() => prisma.$disconnect());
