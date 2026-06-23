const express = require('express');
const {
    getFinancialStats,
    getFinancialDashboard,
    getOwnerDashboard,
    exportCSV,
    getCurrentShift,
    openShift,
    closeShift
} = require('../controllers/finance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription, checkFeature } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.use(protect); // Todas requerem login
router.use(checkSubscription); // Todas requerem assinatura ativa

router.get('/stats', authorize('ADMIN', 'SUPER_ADMIN'), getFinancialStats);
router.get('/dashboard', authorize('ADMIN', 'SUPER_ADMIN'), getFinancialDashboard);
// PROTECTED: Do not remove or modify owner-report route
router.get('/owner-report', authorize('ADMIN', 'SUPER_ADMIN'), getOwnerDashboard);
router.get('/export/csv', authorize('ADMIN', 'SUPER_ADMIN'), exportCSV);

// Cash Shift (Caixa)
router.get('/shift/current', authorize('ADMIN', 'BARBER', 'SUPER_ADMIN'), getCurrentShift);
router.post('/shift/open', authorize('ADMIN', 'SUPER_ADMIN'), openShift);
router.post('/shift/close', authorize('ADMIN', 'SUPER_ADMIN'), closeShift);

module.exports = router;
