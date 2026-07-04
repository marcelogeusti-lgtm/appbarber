const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/support.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/chat', authMiddleware.protect, SupportController.chat);

module.exports = router;
