const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware'); // Ensure auth

// POST /api/payments/create - Initiates a payment
router.post('/create', protect, paymentController.createPayment);

// POST /api/payments/pix - Initiates a Pix payment for an appointment
router.post('/pix', protect, paymentController.createPixPayment);

// GET /api/payments/:id - Checks payment status
router.get('/:id', protect, paymentController.getPaymentStatus);

module.exports = router;
