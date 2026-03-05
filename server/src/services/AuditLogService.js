const prisma = require('../lib/prisma');

class AuditLogService {
    /**
     * Log an action to the database
     * @param {Object} params
     * @param {string} params.actorId - ID of the user performing the action
     * @param {string} params.action - Description of the action (e.g., "UPDATE_PRICE")
     * @param {string} params.entity - Name of the entity being modified (e.g., "Service")
     * @param {string} [params.entityId] - ID of the specific entity instance
     * @param {Object} [params.oldData] - Data before modification
     * @param {Object} [params.newData] - Data after modification
     * @param {string} [params.barbershopId] - Relevant barbershop for this log
     * @param {Object} [params.request] - Express request object to extract IP/UserAgent
     */
    static async log({
        actorId,
        action,
        entity,
        entityId,
        oldData,
        newData,
        barbershopId,
        request
    }) {
        try {
            await prisma.auditLog.create({
                data: {
                    actorId,
                    action,
                    entity,
                    entityId,
                    oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
                    newData: newData ? JSON.parse(JSON.stringify(newData)) : null,
                    barbershopId,
                    ipAddress: request ? (request.headers['x-forwarded-for'] || request.socket.remoteAddress) : null,
                    userAgent: request ? request.headers['user-agent'] : null,
                }
            });
        } catch (error) {
            console.error('[AuditLogService] Failed to create log:', error);
        }
    }

    /**
     * Get logs for a specific barbershop
     */
    static async getLogsByBarbershop(barbershopId, limit = 50) {
        return prisma.auditLog.findMany({
            where: { barbershopId },
            include: { actor: { select: { name: true, email: true } } },
            orderBy: { timestamp: 'desc' },
            take: limit
        });
    }
}

module.exports = AuditLogService;
