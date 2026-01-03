const express = require('express');
const { getFinancialStats, getFinancialDashboard } = require('../controllers/finance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.use(protect); // Todas requerem login
router.use(checkSubscription); // Todas requerem assinatura ativa

router.get('/stats', authorize('ADMIN', 'SUPER_ADMIN'), getFinancialStats);
router.get('/dashboard', authorize('ADMIN', 'SUPER_ADMIN'), getFinancialDashboard);

module.exports = router;
