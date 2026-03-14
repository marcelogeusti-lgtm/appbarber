const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MASTER_EMAIL = 'marcelogeusti@gmail.com';

async function fullReset() {
    console.log('--- STARTING FULL ENVIRONMENT RESET ---');
    console.log(`Master User: ${MASTER_EMAIL}`);
    
    try {
        // 1. Identify Master User
        const masterAuth = await prisma.authUser.findUnique({
            where: { email: MASTER_EMAIL },
            include: { user: true }
        });

        if (!masterAuth || !masterAuth.user) {
            console.error('❌ Master User NOT found! Aborting.');
            return;
        }

        const masterUserId = masterAuth.user.id;
        console.log(`✅ Master identified: ${masterUserId}`);

        // 2. Delete operational data in reverse order of dependencies
        console.log('🗑 Deleting operational data...');
        
        // Logs and notifications
        await prisma.webhookLog.deleteMany({});
        await prisma.communicationLog.deleteMany({});
        await prisma.notification.deleteMany({});
        await prisma.emailLog.deleteMany({});
        await prisma.auditLog.deleteMany({});
        
        // Commissions and Financials
        await prisma.commission.deleteMany({});
        await prisma.professionalServiceCommission.deleteMany({});
        await prisma.transaction.deleteMany({});
        await prisma.payment.deleteMany({});
        
        // Orders
        await prisma.orderItem.deleteMany({});
        await prisma.order.deleteMany({});
        
        // Appointments and waitlist
        await prisma.noShowRecord.deleteMany({});
        await prisma.appointment.deleteMany({});
        await prisma.waitlist.deleteMany({});
        
        // Subscriptions
        await prisma.clientSubscription.deleteMany({});
        await prisma.subscriptionPlan.deleteMany({});
        await prisma.subscriptionExternal.deleteMany({
            where: { userId: { not: masterUserId } }
        });
        
        // Loyalty and Reviews
        await prisma.review.deleteMany({});
        if (prisma.loyaltyProgram) await prisma.loyaltyProgram.deleteMany({}); // Check if exists
        await prisma.favoriteBarbershop.deleteMany({});
        
        // Gateway and Config
        await prisma.gatewayConfig.deleteMany({});
        await prisma.webhook.deleteMany({});
        await prisma.cardToken.deleteMany({});
        await prisma.gatewayCustomer.deleteMany({});
        
        // Shift and Schedule
        await prisma.cashShift.deleteMany({});
        await prisma.schedule.deleteMany({});
        
        // Features and Tokens
        await prisma.featureFlag.deleteMany({});
        await prisma.fcmToken.deleteMany({});
        await prisma.pushSubscription.deleteMany({});
        await prisma.userSystemUpdateRead.deleteMany({});
        await prisma.userCourse.deleteMany({});
        
        // Sessions (except maybe for the current user, but better wipe all to be sure)
        await prisma.session.deleteMany({
            where: { authUserId: { not: masterAuth.id } }
        });

        // 3. Delete Catalogs
        console.log('🗑 Deleting catalogs...');
        await prisma.service.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.professional.deleteMany({
            where: { userId: { not: masterUserId } }
        });

        // 4. Delete Clients
        console.log('🗑 Deleting clients...');
        await prisma.client.deleteMany({});

        // 5. Delete Barbershops
        console.log('🗑 Deleting barbershops...');
        // Unlink staff before deleting
        await prisma.user.updateMany({
            where: { workedBarbershopId: { not: null } },
            data: { workedBarbershopId: null }
        });
        await prisma.barbershop.deleteMany({});

        // 6. Delete Users except Master
        console.log('🗑 Deleting other users...');
        await prisma.user.deleteMany({
            where: { id: { not: masterUserId } }
        });
        await prisma.authUser.deleteMany({
            where: { id: { not: masterAuth.id } }
        });

        // 7. Ensure Master has correct role
        await prisma.user.update({
            where: { id: masterUserId },
            data: { role: 'SUPER_ADMIN' }
        });

        console.log('--- RESET COMPLETED SUCCESSFULLY ---');
        console.log('System is now in a clean state with only the Master User.');

    } catch (e) {
        console.error('❌ Error during reset:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fullReset();
