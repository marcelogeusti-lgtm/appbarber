const prisma = require('../lib/prisma');

/**
 * SubscriptionService
 * Manages the lifecycle of Barbershop SaaS subscriptions (SaaS NEXT)
 */
class SubscriptionService {
    
    /**
     * Re-evaluates a barbershop's subscription status based on current dates.
     * Logic:
     * - TRIAL -> OVERDUE (if expired)
     * - ACTIVE -> OVERDUE (if nextBillingDate passed)
     * - OVERDUE -> BLOCKED (if overdue for > 3 days - grace period)
     */
    static async checkAndUpdateStatus(barbershopId) {
        const shop = await prisma.barbershop.findUnique({ 
            where: { id: barbershopId } 
        });
        
        if (!shop || shop.isTestAccount) return shop?.subscriptionStatus;

        const now = new Date();
        let newStatus = shop.subscriptionStatus;

        // 1. TRIAL LOGIC
        if (shop.subscriptionStatus === 'TRIAL') {
            if (shop.trialEndsAt && now > shop.trialEndsAt) {
                newStatus = 'OVERDUE';
            }
        }

        // 2. ACTIVE LOGIC
        if (shop.subscriptionStatus === 'ACTIVE') {
            if (shop.nextBillingDate && now > shop.nextBillingDate) {
                newStatus = 'OVERDUE';
            }
        }

        // 3. OVERDUE LOGIC (Blocking after grace period)
        if (shop.subscriptionStatus === 'OVERDUE') {
            const dueDate = shop.nextBillingDate || shop.trialEndsAt;
            if (dueDate) {
                const gracePeriodDays = 3;
                const blockDate = new Date(dueDate);
                blockDate.setDate(blockDate.getDate() + gracePeriodDays);

                if (now > blockDate) {
                    newStatus = 'BLOCKED';
                }
            }
        }

        // Update if changed
        if (newStatus !== shop.subscriptionStatus) {
            console.log(`[SubscriptionService] Shop ${shop.slug} status changed: ${shop.subscriptionStatus} -> ${newStatus}`);
            await prisma.barbershop.update({
                where: { id: barbershopId },
                data: { subscriptionStatus: newStatus }
            });
        }

        return newStatus;
    }

    /**
     * Activate a subscription after a successful payment
     */
    static async activateSubscription(barbershopId, planName, monthsToAdd = 1) {
        const now = new Date();
        const nextBillingDate = new Date(now);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + monthsToAdd);

        return prisma.barbershop.update({
            where: { id: barbershopId },
            data: {
                subscriptionStatus: 'ACTIVE',
                saasPlan: planName,
                nextBillingDate: nextBillingDate,
                trialEndsAt: null // Clear trial once they pay
            }
        });
    }
}

module.exports = SubscriptionService;
