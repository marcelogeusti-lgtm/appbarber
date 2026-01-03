module.exports = {
    SOLO: {
        name: 'Solo',
        maxBarbers: 1,
        prices: {
            monthly: 79.90,
            semiannual: 67.80, // valor mensal no plano semestral
            annual: 55.90      // valor mensal no plano anual
        },
        features: ['agenda', 'finance', 'comanda']
    },
    BASIC: {
        name: 'Basic',
        maxBarbers: 5,
        prices: {
            monthly: 109.90,
            semiannual: 93.30,
            annual: 76.90
        },
        features: ['agenda', 'finance', 'comanda', 'reports']
    },
    PRO: {
        name: 'Pro',
        maxBarbers: 15,
        prices: {
            monthly: 164.50,
            semiannual: 139.80,
            annual: 115.15
        },
        features: ['agenda', 'finance', 'comanda', 'whatsapp', 'webhook', 'marketing']
    },
    ENTERPRISE: {
        name: 'Enterprise',
        maxBarbers: 999,
        prices: {
            monthly: 219.90,
            semiannual: 186.80,
            annual: 153.90
        },
        features: ['all']
    }
};
