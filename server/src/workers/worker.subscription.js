const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addMonths, isBefore, isAfter } = require('date-fns');

/**
 * Monthly Subscription Reset Worker
 * This script identifies client subscriptions that have reached their next billing cycle
 * and resets their `remainingCuts` based on the plan's `quantityOfCuts`.
 */
async function resetMonthlySubscriptions() {
    console.log('[Worker] Starting Subscription Reset Sync...');
    const now = new Date();

    try {
        // Find active subscriptions that are past their nextBillingDate
        // and have not been cancelled.
        const subscriptionsToReset = await prisma.clientSubscription.findMany({
            where: {
                status: 'ACTIVE',
                nextBillingDate: {
                    lte: now
                }
            },
            include: {
                plan: true
            }
        });

        console.log(`[Worker] Found ${subscriptionsToReset.length} subscriptions to process.`);

        for (const sub of subscriptionsToReset) {
            try {
                // Determine new billing date (e.g., next month)
                const newBillingDate = addMonths(sub.nextBillingDate, 1);

                // Reset remainingCuts to the plan's allowed quantity
                await prisma.clientSubscription.update({
                    where: { id: sub.id },
                    data: {
                        remainingCuts: sub.plan.quantityOfCuts || 0,
                        nextBillingDate: newBillingDate,
                        updatedAt: now
                    }
                });

                console.log(`[Worker] Reset successful for Sub ID: ${sub.id} (Client: ${sub.clientId}). New Billing: ${newBillingDate}`);
            } catch (err) {
                console.error(`[Worker] Failed to reset Sub ID: ${sub.id}:`, err.message);
            }
        }

        console.log('[Worker] Sync complete.');
    } catch (error) {
        console.error('[Worker] Fatal Error in Subscription Reset Worker:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Export for manual or cron execution
module.exports = { resetMonthlySubscriptions };

// If run directly (e.g. via node)
if (require.main === module) {
    resetMonthlySubscriptions();
}
