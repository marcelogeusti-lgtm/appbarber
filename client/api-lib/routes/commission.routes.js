const express = require('express');
const { getCommissionsReport, payCommissions, giveAdvance, createCommission } = require('../controllers/commission.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/report', protect, authorize('ADMIN', 'SUPER_ADMIN'), getCommissionsReport);
router.post('/pay', protect, authorize('ADMIN', 'SUPER_ADMIN'), payCommissions);
router.post('/advance', protect, authorize('ADMIN', 'SUPER_ADMIN'), giveAdvance);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createCommission);

module.exports = router;
