const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyalty.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/settings', authMiddleware.protect, loyaltyController.getLoyaltySettings);
router.post('/settings', authMiddleware.protect, loyaltyController.updateLoyaltySettings);
router.get('/wallet/apple', authMiddleware.protect, loyaltyController.getAppleWalletPass);
router.get('/wallet/google', authMiddleware.protect, loyaltyController.getGoogleWalletUrl);

module.exports = router;
