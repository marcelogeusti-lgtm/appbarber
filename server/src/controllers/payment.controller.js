const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const prisma = require('../utils/prisma');

exports.createPayment = async (req, res) => {
    try {
        const { amount, method, description, gateway } = req.body;
        const userId = req.user.id; // User from Auth Middleware

        // 1. Validate Input
        if (!amount || !method) {
            return res.status(400).json({ error: 'Amount and method are required' });
        }

        // 2. Fetch User Details for Customer Data
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                phone: true,
                barbershopId: true // Needed for config lookup
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // 3. Call Orchestrator
        const paymentResult = await PaymentOrchestrator.createPayment({
            amount,
            method,
            description: description || `Payment for user ${user.name}`,
            gateway, // Optional, defaults to Velify
            barbershopId: user.barbershopId, // PASSING CONTEXT
            customer: {
                name: user.name,
                email: user.email,
                phone: user.phone
                // taxId: user.document 
            }
        });

        // 4. Save to Database (Pending State)
        const payment = await prisma.payment.create({
            data: {
                gateway: paymentResult.gateway,
                method,
                externalId: paymentResult.externalId,
                status: paymentResult.status,
                amount,
                userId,
                // orderId: ... (If linked to an order)
            }
        });

        // 5. Return Response
        return res.status(201).json({
            paymentId: payment.id,
            qrCode: paymentResult.qrCode,
            qrCodeBase64: paymentResult.qrCodeBase64,
            status: paymentResult.status,
            externalId: paymentResult.externalId
        });

    } catch (error) {
        console.error('Create Payment Error:', error);
        return res.status(500).json({ error: 'Failed to create payment' });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await prisma.payment.findUnique({
            where: { id }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        return res.json(payment);
    } catch (error) {
        console.error('Get Payment Status Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
