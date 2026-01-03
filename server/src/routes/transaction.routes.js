const express = require('express');
const router = express.Router();
const { createTransaction, getTransactions, deleteTransaction } = require('../controllers/transaction.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

router.use(protect);
router.use(checkSubscription);

router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createTransaction);
router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), getTransactions);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN'), deleteTransaction);

module.exports = router;
