const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBarbershops() {
    const slugs = ['test-barber', 'test-barber-1', 'test-barber-2', 'geustti', 'nobre-corte', 'nevves28'];
    const shops = await prisma.barbershop.findMany({
        where: { slug: { in: slugs } },
        include: {
            owner: {
                include: {
                    authUser: true
                }
            }
        }
    });

    console.log(JSON.stringify(shops, null, 2));
}

findBarbershops().finally(() => prisma.$disconnect());
