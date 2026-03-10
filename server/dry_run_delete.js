const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dryRun() {
    const slugs = ['test-barber', 'test-barber-1', 'test-barber-2', 'geustti', 'nobre-corte', 'nevves28'];

    console.log('--- DRY RUN: Account Deletion ---');

    const shops = await prisma.barbershop.findMany({
        where: { slug: { in: slugs } },
        include: {
            owner: {
                include: {
                    ownedBarbershops: true,
                    workedBarbershop: true
                }
            }
        }
    });

    for (const shop of shops) {
        console.log(`\nBARBERSHOP: ${shop.name} (${shop.slug})`);
        console.log(`  ID: ${shop.id}`);

        // Count dependencies
        const counts = {
            services: await prisma.service.count({ where: { barbershopId: shop.id } }),
            products: await prisma.product.count({ where: { barbershopId: shop.id } }),
            appointments: await prisma.appointment.count({ where: { barbershopId: shop.id } }),
            staff: await prisma.user.count({ where: { workedBarbershopId: shop.id } }),
            orders: await prisma.order.count({ where: { barbershopId: shop.id } }),
            reviews: await prisma.review.count({ where: { barbershopId: shop.id } }),
            subscriptionPlans: await prisma.subscriptionPlan.count({ where: { barbershopId: shop.id } }),
        };

        console.log('  Dependencies:', counts);

        if (shop.owner) {
            console.log(`  OWNER: ${shop.owner.name} (${shop.owner.email})`);
            console.log(`    AuthUser ID: ${shop.owner.authUserId}`);
            console.log(`    Total Owned Shops: ${shop.owner.ownedBarbershops.length}`);

            if (shop.owner.authUserId) {
                const clientProfile = await prisma.client.findUnique({ where: { authUserId: shop.owner.authUserId } });
                console.log(`    Has Client Profile: ${!!clientProfile}`);
            }
        } else {
            console.log('  OWNER: NONE');
        }
    }
}

dryRun().finally(() => prisma.$disconnect());
