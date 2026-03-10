const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAccounts() {
    const slugs = ['test-barber', 'test-barber-1', 'test-barber-2', 'geustti', 'nobre-corte', 'nevves28'];

    console.log('--- STARTING ACCOUNT DELETION ---');

    const shops = await prisma.barbershop.findMany({
        where: { slug: { in: slugs } },
        include: {
            owner: true
        }
    });

    for (const shop of shops) {
        console.log(`\nDeleting Barbershop: ${shop.name} (${shop.slug})...`);
        const id = shop.id;
        const ownerId = shop.ownerId;
        const authUserId = shop.owner?.authUserId;

        try {
            console.log('  1. Cleaning up appointment dependencies...');
            await prisma.review.deleteMany({ where: { barbershopId: id } });
            await prisma.noShowRecord.deleteMany({ where: { barbershopId: id } });

            console.log('  2. Cleaning up order items...');
            await prisma.orderItem.deleteMany({ where: { order: { barbershopId: id } } });

            console.log('  3. Cleaning up orders and transactions...');
            await prisma.order.deleteMany({ where: { barbershopId: id } });
            await prisma.commission.deleteMany({ where: { barbershopId: id } });
            await prisma.transaction.deleteMany({ where: { barbershopId: id } });

            console.log('  4. Cleaning up appointments...');
            await prisma.appointment.deleteMany({ where: { barbershopId: id } });

            console.log('  5. Cleaning up services and products...');
            await prisma.service.deleteMany({ where: { barbershopId: id } });
            await prisma.product.deleteMany({ where: { barbershopId: id } });

            console.log('  6. Cleaning up shop generic data (waitlist, plans, etc.)...');
            await prisma.waitlist.deleteMany({ where: { barbershopId: id } });
            await prisma.subscriptionPlan.deleteMany({ where: { barbershopId: id } });
            await prisma.clientSubscription.deleteMany({ where: { plan: { barbershopId: id } } });
            await prisma.webhook.deleteMany({ where: { barbershopId: id } });
            await prisma.gatewayConfig.deleteMany({ where: { barbershopId: id } });
            await prisma.cashShift.deleteMany({ where: { barbershopId: id } });
            await prisma.payment.deleteMany({ where: { barbershopId: id } });
            await prisma.gatewayCustomer.deleteMany({ where: { barbershopId: id } });
            await prisma.cardToken.deleteMany({ where: { barbershopId: id } });
            await prisma.featureFlag.deleteMany({ where: { barbershopId: id } });
            await prisma.auditLog.deleteMany({ where: { barbershopId: id } });
            await prisma.favoriteBarbershop.deleteMany({ where: { barbershopId: id } });
            await prisma.loyaltyProgram.deleteMany({ where: { barbershopId: id } });
            await prisma.notificationTemplate.deleteMany({ where: { barbershopId: id } });
            await prisma.pushSubscription.deleteMany({ where: { user: { workedBarbershopId: id } } });

            console.log('  7. Unlinking staff...');
            await prisma.user.updateMany({
                where: { workedBarbershopId: id },
                data: { workedBarbershopId: null }
            });

            console.log('  8. Deleting Barbershop record...');
            await prisma.barbershop.delete({ where: { id: id } });
            console.log('  Barbershop deleted.');

            if (ownerId) {
                console.log(`  9. Deleting Owner profiles (${ownerId})...`);
                await prisma.professional.deleteMany({ where: { userId: ownerId } });

                if (authUserId) {
                    await prisma.client.deleteMany({ where: { authUserId: authUserId } });
                    await prisma.user.deleteMany({ where: { authUserId: authUserId } });
                    await prisma.authUser.delete({ where: { id: authUserId } });
                    console.log('  Owner, Professional Profile, and AuthUser deleted.');
                } else {
                    await prisma.user.delete({ where: { id: ownerId } });
                    console.log('  Owner record deleted.');
                }
            }

        } catch (err) {
            console.error(`  ERROR deleting ${shop.slug}:`, err);
        }
    }

    console.log('\n--- DELETION COMPLETE ---');
}

deleteAccounts().finally(() => prisma.$disconnect());
