const express = require('express');
const router = express.Router();
const SupportController = require('../controllers/support.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Chat de Suporte Inteligente (protegido por autenticação)
router.post('/chat', authMiddleware.protect, SupportController.chat);

module.exports = router;
