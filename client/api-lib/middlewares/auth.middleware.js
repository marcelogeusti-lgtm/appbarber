const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, role, authUserId, barbershopId }

        // Update lastActive asynchronously to not block the request
        if (decoded.authUserId) {
            const prisma = require('../lib/prisma');
            prisma.session.updateMany({
                where: { authUserId: decoded.authUserId, token: token },
                data: { lastActive: new Date() }
            }).catch(err => console.error('[AUTH] Failed to update session activity:', err.message));
        }

        next();
    } catch (error) {
        console.error(`[AUTH] Token verification failed for ${req.headers.authorization?.substring(0, 15)}... :`, error.message);
        res.status(401).json({ message: 'Sessão inválida ou expirada. Por favor, faça login novamente.' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        // SUPER_ADMIN has access to everything
        if (req.user && req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};
