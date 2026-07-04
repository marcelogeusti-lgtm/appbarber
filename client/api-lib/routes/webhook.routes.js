const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');
const saasWebhookController = require('../controllers/saasWebhook.controller');

// SaaS billing (Cakto) — must come before the dynamic /:gateway route
router.post('/cakto', saasWebhookController.handleCaktoWebhook);

// Dynamic route for different gateways
// POST /webhooks/mercadopago
router.post('/:gateway', webhookController.handleWebhook);

module.exports = router;
