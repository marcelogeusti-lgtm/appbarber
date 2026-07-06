const jwt = require('jsonwebtoken');

// Throttle do "lastActive": com connection_limit=1 por função, gravar a
// atividade da sessão em TODA requisição disputa a única conexão e trava
// as consultas reais (P2024/57014 vistos em produção). Uma gravação a
// cada 5 min por sessão é mais que suficiente para "dispositivos ativos".
const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;
const sessionLastTouch = new Map(); // token -> timestamp (por instância warm)

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
        const lastTouch = sessionLastTouch.get(token) || 0;
        if (decoded.authUserId && Date.now() - lastTouch > SESSION_TOUCH_INTERVAL_MS) {
            sessionLastTouch.set(token, Date.now());
            if (sessionLastTouch.size > 500) sessionLastTouch.clear(); // evita crescimento sem fim
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
