const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saasPlans = require('../config/saasPlans');

exports.checkSubscription = async (req, res, next) => {
    try {
        // Ignorar verificação para Clientes e SUPER_ADMIN (mestre)
        if (!req.user || req.user.role === 'CLIENT' || req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        // Se for admin ou barbeiro, precisa validar a assinatura da barbearia
        const barbershopId = req.user.barbershopId || req.user.workedBarbershopId;

        if (!barbershopId) {
            // Se não tem barbearia vinculada, teoricamente não acessa dados sensíveis, 
            // mas por segurança pode bloquear ou deixar passar dependendo da rota.
            // Vamos assumir que rotas protegidas precisam de barbearia.
            return res.status(403).json({ message: 'Barbershop association required' });
        }

        const barbershop = await prisma.barbershop.findUnique({
            where: { id: barbershopId },
            select: { subscriptionStatus: true, saasPlan: true }
        });

        if (!barbershop) {
            return res.status(404).json({ message: 'Barbershop not found' });
        }

        // Anexar plano ao request para uso posterior (ex: limites)
        req.user.saasPlan = barbershop.saasPlan;

        // REGRA B: Acesso bloqueado se não estiver ACTIVE
        if (barbershop.subscriptionStatus !== 'ACTIVE') {
            return res.status(403).json({
                message: 'Subscription Inactive',
                reason: barbershop.subscriptionStatus
            });
        }

        next();
    } catch (error) {
        console.error('Subscription Check Error:', error);
        res.status(500).json({ message: 'Server error checking subscription' });
    }
};

exports.checkFeature = (feature) => {
    return (req, res, next) => {
        try {
            // Bypass for Super Admin
            if (req.user && req.user.role === 'SUPER_ADMIN') return next();

            // Bypass for Clients (usually features are for admin usage, but if a client accesses a feature, assume allowed? No, features are SaaS features)
            // Actually clients don't use SaaS features directly, they use the service.

            const userPlan = req.user.saasPlan || 'BASIC'; // Default to BASIC if missing (should be set by checkSubscription)

            const planConfig = saasPlans[userPlan] || saasPlans.BASIC;

            if (planConfig.features.includes('all') || planConfig.features.includes(feature)) {
                return next();
            }

            return res.status(403).json({
                message: `Upgrade required via checkFeature`,
                requiredFeature: feature,
                currentPlan: userPlan
            });
        } catch (error) {
            console.error('Feature Check Error:', error);
            res.status(500).json({ message: 'Server error checking feature' });
        }
    };
};
