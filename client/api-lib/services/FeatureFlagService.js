const prisma = require('../lib/prisma');

class FeatureFlagService {
    /**
     * Check if a feature is enabled for a specific barbershop
     * @param {string} key - Feature flag key
     * @param {string} barbershopId - The ID of the barbershop (tenant)
     * @returns {Promise<boolean>}
     */
    static async isEnabled(key, barbershopId = null) {
        try {
            // 1. Check for specific tenant flag
            if (barbershopId) {
                const tenantFlag = await prisma.featureFlag.findUnique({
                    where: {
                        key_barbershopId: { key, barbershopId }
                    }
                });

                if (tenantFlag) return tenantFlag.enabled;
            }

            // 2. Fallback to global flag (where barbershopId is null)
            // findFirst: compound unique input rejects null barbershopId
            const globalFlag = await prisma.featureFlag.findFirst({
                where: { key, barbershopId: null }
            });

            return globalFlag ? globalFlag.enabled : false;
        } catch (error) {
            console.error(`[FeatureFlagService] Error checking flag ${key}:`, error);
            return false;
        }
    }

    /**
     * Set a feature flag value
     */
    static async setFlag(key, enabled, barbershopId = null, description = null) {
        // upsert via compound unique rejects null barbershopId (global flags)
        const existing = await prisma.featureFlag.findFirst({
            where: { key, barbershopId }
        });

        if (existing) {
            return prisma.featureFlag.update({
                where: { id: existing.id },
                data: { enabled, description }
            });
        }

        return prisma.featureFlag.create({
            data: { key, enabled, barbershopId, description }
        });
    }

    /**
     * List all flags for a barbershop (merging with globals)
     */
    static async getAllFlags(barbershopId = null) {
        const flags = await prisma.featureFlag.findMany({
            where: {
                OR: [
                    { barbershopId: null },
                    { barbershopId: barbershopId }
                ]
            }
        });

        // If specific tenantRequested, we might want to override globals
        // but for now, simple list is enough
        return flags;
    }
}

module.exports = FeatureFlagService;
