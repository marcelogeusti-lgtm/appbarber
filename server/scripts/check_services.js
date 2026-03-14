const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const nextShop = await prisma.barbershop.findUnique({ where: { slug: 'next' } });
        if (!nextShop) {
            console.log('NEXT shop not found');
            return;
        }
        const services = await prisma.service.findMany({ where: { barbershopId: nextShop.id } });
        console.log(`Services for NEXT (${nextShop.id}):`, services.length);
        services.forEach(s => console.log(` - ${s.name}: ${s.price}`));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
