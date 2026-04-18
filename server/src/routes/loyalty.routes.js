const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyalty.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware.protect, loyaltyController.getLoyaltySettings);
router.put('/', authMiddleware.protect, loyaltyController.updateLoyaltySettings);
router.get('/settings', authMiddleware.protect, loyaltyController.getLoyaltySettings);
router.post('/settings', authMiddleware.protect, loyaltyController.updateLoyaltySettings);
router.get('/wallet/apple', authMiddleware.protect, loyaltyController.getAppleWalletPass);
router.get('/wallet/google', authMiddleware.protect, loyaltyController.getGoogleWalletUrl);

router.get('/client/:clientId', authMiddleware.protect, loyaltyController.getClientLoyalty);
router.post('/redeem', authMiddleware.protect, loyaltyController.redeemPoints);

module.exports = router;
