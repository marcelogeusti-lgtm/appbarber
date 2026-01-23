const express = require('express');
const { getFinancialStats, getFinancialDashboard } = require('../controllers/finance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription, checkFeature } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.use(protect); // Todas requerem login
router.use(checkSubscription); // Todas requerem assinatura ativa

router.get('/stats', authorize('ADMIN', 'SUPER_ADMIN'), checkFeature('reports'), getFinancialStats);
router.get('/dashboard', authorize('ADMIN', 'SUPER_ADMIN'), getFinancialDashboard);

// Cash Shift (Caixa)
router.get('/shift/current', authorize('ADMIN', 'BARBER', 'SUPER_ADMIN'), orderController.getCurrentShift || (req, res, next) => {
    // Re-routing to finance controller since I added it there
    const financeController = require('../controllers/finance.controller');
    return financeController.getCurrentShift(req, res);
});
router.post('/shift/open', authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    const financeController = require('../controllers/finance.controller');
    return financeController.openShift(req, res);
});
router.post('/shift/close', authorize('ADMIN', 'SUPER_ADMIN'), (req, res) => {
    const financeController = require('../controllers/finance.controller');
    return financeController.closeShift(req, res);
});

module.exports = router;
