const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware'); // Ensure auth

// POST /api/payments/create - Initiates a payment
router.post('/create', protect, paymentController.createPayment);

// POST /api/payments/process-brick - Handler for Mercado Pago Bricks
router.post('/process-brick', protect, paymentController.createBrickPayment);

// POST /api/payments/pix - Initiates a Pix payment for an appointment
router.post('/pix', protect, paymentController.createPixPayment);

// POST /api/payments/card - Initiates a Card payment for an appointment
router.post('/card', protect, paymentController.createCardPayment);

// Stripe: cria o PaymentIntent e confirma o status (fluxo Elements)
router.post('/stripe/intent', protect, paymentController.createStripeIntent);
router.post('/stripe/confirm', protect, paymentController.confirmStripePayment);

// POST /api/payments/cards - Save a card for future use
router.post('/cards', protect, paymentController.saveCard);

// GET /api/payments/cards - List saved cards
router.get('/cards', protect, paymentController.listCards);

// GET /api/payments/public-key - Get active gateway public key for a shop
router.get('/public-key', paymentController.getPublicKey);

// GET /api/payments/:id - Checks payment status (Public for Link access)
router.get('/:id', paymentController.getPaymentStatus);

// DELETE /api/payments/cards/:id - Remove a saved card
router.delete('/cards/:id', protect, paymentController.deleteCard);

module.exports = router;
