const express = require('express');
const { getFinancialStats, getFinancialDashboard } = require('../controllers/finance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/stats', protect, authorize('ADMIN', 'SUPER_ADMIN'), getFinancialStats);
router.get('/dashboard', protect, authorize('ADMIN', 'SUPER_ADMIN'), getFinancialDashboard);

module.exports = router;
