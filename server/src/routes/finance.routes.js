const express = require('express');
const { getFinancialStats } = require('../controllers/finance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/stats', protect, authorize('ADMIN', 'SUPER_ADMIN'), getFinancialStats);

module.exports = router;
