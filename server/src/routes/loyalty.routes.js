const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyalty.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware.protect, loyaltyController.getLoyaltySettings);
router.put('/', authMiddleware.protect, loyaltyController.updateLoyaltySettings);

module.exports = router;
