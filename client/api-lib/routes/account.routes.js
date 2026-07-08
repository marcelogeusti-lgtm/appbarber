const express = require('express');
const router = express.Router();
const c = require('../controllers/account.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER', 'RECEPTIONIST'));

router.get('/', c.getBalances);
router.get('/:clientId', c.getStatement);
router.post('/', c.addEntry);

module.exports = router;
