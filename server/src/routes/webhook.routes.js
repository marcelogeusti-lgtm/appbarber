const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware.protect);

router.post('/', webhookController.createWebhook);
router.get('/', webhookController.getWebhooks);
router.put('/:id', webhookController.updateWebhook);
router.delete('/:id', webhookController.deleteWebhook);

module.exports = router;
