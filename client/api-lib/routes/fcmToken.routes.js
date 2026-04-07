const express = require('express');
const router = express.Router();
const fcmTokenController = require('../controllers/fcmToken.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

// All routes require authentication
router.use(authMiddleware.protect);

router.post('/fcm-token', fcmTokenController.saveToken);
router.delete('/fcm-token/:token', fcmTokenController.deleteToken);

module.exports = router;
