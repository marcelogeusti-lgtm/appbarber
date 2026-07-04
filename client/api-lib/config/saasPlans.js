module.exports = {
    SOLO: {
        name: 'Start (Solo)',
        maxBarbers: 1,
        prices: {
            monthly: 79.90,
            semiannual: 67.80, // valor mensal no plano semestral
            annual: 55.90      // valor mensal no plano anual
        },
        features: ['agenda', 'finance', 'comanda']
    },
    PRO: {
        name: 'Pro',
        maxBarbers: 5,
        prices: {
            monthly: 164.50,
            semiannual: 139.80,
            annual: 115.15
        },
        features: ['agenda', 'finance', 'comanda', 'reports', 'whatsapp', 'webhook', 'marketing']
    },
    ENTERPRISE: {
        name: 'Empire',
        maxBarbers: 100,
        prices: {
            monthly: 219.90,
            semiannual: 186.80,
            annual: 153.90
        },
        features: ['all']
    }
};
