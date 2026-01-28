const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPayment = async (req, res) => {
    try {
        const { amount, method, description, gateway, barbershopId, appointmentId, orderId } = req.body;
        const userId = req.user.id;

        if (!amount || !method) {
            return res.status(400).json({ error: 'Amount and method are required' });
        }

        // Fetch User/Client details
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { authUser: true }
        });

        // 1. Create Pending Payment
        const pendingPayment = await prisma.payment.create({
            data: {
                gateway: gateway || 'PENDING',
                method,
                status: 'PENDING',
                amount,
                userId,
                appointmentId,
                orderId,
                barbershopId
            }
        });

        try {
            // 2. Call Gateway
            const paymentResult = await PaymentOrchestrator.createPayment({
                amount,
                method,
                description: description || `Payment for user ${user?.name || userId}`,
                gateway,
                barbershopId,
                customer: {
                    name: user?.name || 'Cliente',
                    email: user?.authUser?.email || user?.email,
                    phone: user?.phone
                },
                externalId: pendingPayment.id // Pass DB UUID
            });

            // 3. Update Payment
            const updatedPayment = await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    gateway: paymentResult.gateway,
                    externalId: paymentResult.paymentId,
                    status: paymentResult.status,
                    qrCode: paymentResult.qrCode,
                    pixCopiaECola: paymentResult.pixCopiaECola
                }
            });

            return res.status(201).json({
                paymentId: updatedPayment.id,
                qrCode: updatedPayment.qrCode,
                qrCodeBase64: paymentResult.qrCodeBase64, // Pass ephemeral base64
                pixCopiaECola: updatedPayment.pixCopiaECola,
                status: updatedPayment.status,
                externalId: updatedPayment.externalId
            });
        } catch (gatewayError) {
            console.error('Gateway Error:', gatewayError);
            await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: { status: 'FAILED' }
            });
            return res.status(502).json({ error: 'Failed to communicate with payment gateway' });
        }
    } catch (error) {
        console.error('Create Payment Error:', error);
        return res.status(500).json({ error: 'Failed to create payment' });
    }
};

exports.createPixPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const userId = req.user.id;

        if (!appointmentId) {
            return res.status(400).json({ error: 'Appointment ID is required' });
        }

        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                barbershop: true,
                service: true,
                client: { include: { authUser: true } }
            }
        });

        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

        const amount = appointment.service.price;

        // 1. Create PENDING Payment locally first
        const pendingPayment = await prisma.payment.create({
            data: {
                gateway: 'PENDING', // Will be updated
                method: 'PIX',
                status: 'PENDING',
                amount: amount,
                userId: req.user.id,
                appointmentId: appointment.id,
                barbershopId: appointment.barbershopId
            }
        });

        try {
            // 2. Call Gateway with the generated ID as externalReference
            const paymentResult = await PaymentOrchestrator.createPayment({
                amount,
                method: 'PIX',
                description: `Agendamento #${appointment.id.slice(0, 8)}`,
                barbershopId: appointment.barbershopId,
                customer: {
                    name: appointment.client.name,
                    email: appointment.client.authUser?.email,
                    phone: appointment.client.phone
                },
                externalId: pendingPayment.id // Pass the DB UUID
            });

            // 3. Update Payment with Gateway Response
            const updatedPayment = await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    gateway: paymentResult.gateway,
                    externalId: paymentResult.paymentId, // The ID from Gateway (e.g., MP ID)
                    status: paymentResult.status,
                    qrCode: paymentResult.qrCode,
                    pixCopiaECola: paymentResult.pixCopiaECola
                }
            });

            return res.status(201).json({
                paymentId: updatedPayment.id,
                qrCode: updatedPayment.qrCode,
                qrCodeBase64: paymentResult.qrCodeBase64,
                pixCopiaECola: updatedPayment.pixCopiaECola,
                status: updatedPayment.status
            });

        } catch (gatewayError) {
            console.error('Gateway Error:', gatewayError);
            // Optional: Mark as FAILED or cancel
            await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: { status: 'FAILED' }
            });
            return res.status(502).json({ error: 'Erro de comunicação com gateway de pagamento.' });
        }
    } catch (error) {
        console.error('Create Pix Error:', error);
        return res.status(500).json({ error: 'Erro ao gerar Pix' });
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
