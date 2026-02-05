/**
 * Middleware to enforce Logical Multi-tenancy
 * Ensures that any request that should be scoped to a barbershop HAS a barbershopId.
 */
exports.enforceTenant = (req, res, next) => {
    // 1. Get barbershopId from query, params, or user token
    const barbershopId = req.query.barbershopId || req.params.barbershopId || req.user?.barbershopId;

    if (!barbershopId) {
        // SUPER_ADMIN might not have a fixed barbershopId in token if they are managing multiple
        if (req.user?.role === 'SUPER_ADMIN') {
            return next();
        }
        return res.status(400).json({
            message: 'Barbershop ID (tenant_id) is required for this operation.'
        });
    }

    // 2. Attach to request for easy access in controllers
    req.tenantId = barbershopId;

    // 3. Security Check: If user is NOT SUPER_ADMIN, they can ONLY access their own barbershopId
    if (req.user && req.user.role !== 'SUPER_ADMIN' && req.user.barbershopId) {
        if (req.user.barbershopId !== barbershopId) {
            return res.status(403).json({
                message: 'Access Denied: You do not have permission to access data from another barbershop.'
            });
        }
    }

    next();
};

/**
 * Utility to inject tenantId into Prisma queries
 * This is a conceptual helper.
 */
exports.withTenant = (req, whereClause = {}) => {
    if (req.user?.role === 'SUPER_ADMIN' && !req.tenantId) {
        return whereClause;
    }
    return {
        ...whereClause,
        barbershopId: req.tenantId
    };
};
