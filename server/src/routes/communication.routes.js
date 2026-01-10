const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communication.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/status', authMiddleware.protect, communicationController.getStatus);
router.get('/conversations', authMiddleware.protect, communicationController.getConversations);
router.get('/messages/:clientId', authMiddleware.protect, communicationController.getMessages);
router.post('/send', authMiddleware.protect, communicationController.sendManualMessage);

module.exports = router;
