const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

router.get('/templates', protect, checkSubscription, notificationController.getTemplates);
router.post('/templates', protect, checkSubscription, notificationController.saveTemplate);

module.exports = router;
