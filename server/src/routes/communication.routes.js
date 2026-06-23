const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communication.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/status', authMiddleware.protect, communicationController.getStatus);
router.get('/logs', authMiddleware.protect, communicationController.getMessageLogs);


module.exports = router;
