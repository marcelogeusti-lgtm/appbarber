const prisma = require('../../lib/prisma');

// Limites mensais de mensagens por plano (custo do motor é da plataforma).
// Sobrescrevíveis via PlatformSetting: WA_LIMIT_SOLO / WA_LIMIT_PRO / WA_LIMIT_ENTERPRISE
const DEFAULT_LIMITS = {
    SOLO: 300,
    PRO: 1000,
    ENTERPRISE: 3000
};

let cache = { limits: null, loadedAt: 0 };

async function getLimits() {
    if (cache.limits && Date.now() - cache.loadedAt < 60_000) return cache.limits;
    const rows = await prisma.platformSetting.findMany({
        where: { key: { in: ['WA_LIMIT_SOLO', 'WA_LIMIT_PRO', 'WA_LIMIT_ENTERPRISE'] } }
    });
    const limits = { ...DEFAULT_LIMITS };
    for (const row of rows) {
        const plan = row.key.replace('WA_LIMIT_', '');
        const parsed = parseInt(row.value, 10);
        if (!Number.isNaN(parsed) && parsed >= 0) limits[plan] = parsed;
    }
    cache = { limits, loadedAt: Date.now() };
    return limits;
}

async function getUsage(barbershopId) {
    const shop = await prisma.barbershop.findUnique({
        where: { id: barbershopId },
        select: { saasPlan: true }
    });
    const limits = await getLimits();
    const limit = limits[shop?.saasPlan] ?? DEFAULT_LIMITS.SOLO;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const used = await prisma.communicationLog.count({
        where: {
            barbershopId,
            channel: 'WHATSAPP',
            direction: 'OUTBOUND',
            status: 'SENT',
            createdAt: { gte: monthStart }
        }
    });

    return { used, limit, plan: shop?.saasPlan || null, allowed: used < limit };
}

function refreshConfig() {
    cache = { limits: null, loadedAt: 0 };
}

module.exports = { getUsage, refreshConfig, DEFAULT_LIMITS };
