const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const saasPlans = require('../config/saasPlans');

const subscriptionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

exports.checkSubscription = async (req, res, next) => {
    try {
        // Ignorar verificação para Clientes e SUPER_ADMIN (mestre)
        if (!req.user || req.user.role === 'CLIENT' || req.user.role === 'SUPER_ADMIN') {
            return next();
        }

        // Se for admin ou barbeiro, precisa validar a assinatura da barbearia
        const barbershopId = req.user.barbershopId || req.user.workedBarbershopId;

        if (!barbershopId) {
            return res.status(403).json({ message: 'Barbershop association required' });
        }

        // CACHE CHECK
        const cached = subscriptionCache.get(barbershopId);
        const now = Date.now();
        let barbershopData;

        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            barbershopData = cached.data;
        } else {
            // DB FETCH
            const barbershop = await prisma.barbershop.findUnique({
                where: { id: barbershopId },
                select: { subscriptionStatus: true, saasPlan: true, trialEndsAt: true }
            });

            if (!barbershop) {
                return res.status(404).json({ message: 'Barbershop not found' });
            }

            barbershopData = barbershop;

            // UPDATE CACHE
            subscriptionCache.set(barbershopId, {
                timestamp: now,
                data: barbershopData
            });
        }

        // Anexar plano e status ao request
        req.user.saasPlan = barbershopData.saasPlan;
        req.user.subscriptionStatus = barbershopData.subscriptionStatus; // [NEW] Para uso em checkFeature

        // REGRA B: Acesso bloqueado se não estiver ACTIVE ou TRIAL válido
        if (barbershopData.subscriptionStatus === 'ACTIVE') {
            // OK
        } else if (barbershopData.subscriptionStatus === 'TRIAL') {
            const current = new Date();
            const trialEnd = barbershopData.trialEndsAt ? new Date(barbershopData.trialEndsAt) : null;

            if (!trialEnd || current > trialEnd) {
                return res.status(403).json({
                    message: 'Trial Expired',
                    reason: 'TRIAL_EXPIRED',
                    trialEndsAt: barbershopData.trialEndsAt
                });
            }
            // OK (Trial Valid)
        } else {
            return res.status(403).json({
                message: 'Subscription Inactive',
                reason: barbershopData.subscriptionStatus
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

            // [NEW] Bypass for TRIAL users (Full Access during trial)
            if (req.user && req.user.subscriptionStatus === 'TRIAL') {
                return next();
            }

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
