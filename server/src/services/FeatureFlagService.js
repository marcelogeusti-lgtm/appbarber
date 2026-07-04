const prisma = require('../lib/prisma');

class FeatureFlagService {
    /**
     * Check if a feature is enabled for a specific barbershop
     * @param {string} key - Feature flag key
     * @param {string} barbershopId - The ID of the barbershop (tenant)
     * @returns {Promise<boolean>}
     */
    static async isEnabled(key, barbershopId = null, userId = null) {
        try {
            // 1. Fetch the flag definition (assuming we look for the global one first to get rules)
            // findFirst: compound unique input rejects null barbershopId
            const globalFlag = await prisma.featureFlag.findFirst({
                where: { key, barbershopId: null }
            });

            if (!globalFlag) return false;

            // 2. If it's explicitly enabled for everyone, return true
            if (globalFlag.enabled) return true;

            // 3. Check for specific tenant/shop override
            if (barbershopId) {
                const tenantFlag = await prisma.featureFlag.findUnique({
                    where: {
                        key_barbershopId: { key, barbershopId }
                    }
                });

                if (tenantFlag) return tenantFlag.enabled;
            }

            // 4. Check for Plan-level permissions
            if (barbershopId && globalFlag.allowedPlans && globalFlag.allowedPlans.length > 0) {
                const shop = await prisma.barbershop.findUnique({
                    where: { id: barbershopId },
                    select: { saasPlan: true }
                });

                if (shop && globalFlag.allowedPlans.includes(shop.saasPlan)) {
                    return true;
                }
            }

            // 5. Check for specific User-level permissions (Beta testers)
            if (userId && globalFlag.allowedUsers && globalFlag.allowedUsers.length > 0) {
                if (globalFlag.allowedUsers.includes(userId)) {
                    return true;
                }
            }

            // 6. Check if the Barbershop ID is in the allowed users list (treating shop as entity)
            if (barbershopId && globalFlag.allowedUsers && globalFlag.allowedUsers.length > 0) {
                if (globalFlag.allowedUsers.includes(barbershopId)) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error(`[FeatureFlagService] Error checking flag ${key}:`, error);
            return false;
        }
    }

    /**
     * Set a feature flag value
     */
    static async setFlag(key, enabled, barbershopId = null, description = null, allowedPlans = [], allowedUsers = []) {
        // upsert via compound unique rejects null barbershopId (global flags)
        const existing = await prisma.featureFlag.findFirst({
            where: { key, barbershopId }
        });

        if (existing) {
            return prisma.featureFlag.update({
                where: { id: existing.id },
                data: {
                    enabled,
                    description,
                    allowedPlans: allowedPlans.length > 0 ? allowedPlans : undefined,
                    allowedUsers: allowedUsers.length > 0 ? allowedUsers : undefined
                }
            });
        }

        return prisma.featureFlag.create({
            data: {
                key,
                enabled,
                barbershopId,
                description,
                allowedPlans,
                allowedUsers
            }
        });
    }

    /**
     * List all flags for a barbershop (merging with globals and applying plan logic)
     */
    static async getAllFlags(barbershopId = null, userId = null) {
        // Fetch all definitions
        const allFlags = await prisma.featureFlag.findMany({
            where: {
                OR: [
                    { barbershopId: null },
                    { barbershopId: barbershopId }
                ]
            }
        });

        // We can enrich this list if needed by running 'isEnabled' check for each unique key
        // But for the Master Panel, we just return the raw data.
        return allFlags;
    }
}

module.exports = FeatureFlagService;
