const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Dynamic route for different gateways
// POST /webhooks/mercadopago
router.post('/:gateway', webhookController.handleWebhook);

module.exports = router;
