const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Dynamic route for different gateways
// POST /webhooks/stripe
// POST /webhooks/mercadopago
// POST /webhooks/velify
router.post('/:gateway', webhookController.handleWebhook);

module.exports = router;
