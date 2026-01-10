const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middlewares/auth.middleware');
const subscription = require('../middlewares/subscription.middleware');

router.get('/templates', auth, subscription, notificationController.getTemplates);
router.post('/templates', auth, subscription, notificationController.saveTemplate);

module.exports = router;
