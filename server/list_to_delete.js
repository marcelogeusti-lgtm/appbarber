const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findBarbershops() {
    const slugs = ['test-barber', 'test-barber-1', 'test-barber-2', 'geustti', 'nobre-corte', 'nevves28'];
    const shops = await prisma.barbershop.findMany({
        where: { slug: { in: slugs } },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    authUserId: true
                }
            }
        }
    });

    shops.forEach(shop => {
        console.log(`SLUG: ${shop.slug}`);
        console.log(`  Shop ID: ${shop.id}`);
        console.log(`  Shop Name: ${shop.name}`);
        console.log(`  Owner ID: ${shop.owner?.id}`);
        console.log(`  Owner Email: ${shop.owner?.email}`);
        console.log(`  AuthUser ID: ${shop.owner?.authUserId}`);
        console.log('---');
    });
}

findBarbershops().finally(() => prisma.$disconnect());
