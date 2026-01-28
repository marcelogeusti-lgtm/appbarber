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
            }
        });

        const payment = await prisma.payment.create({
            data: {
                gateway: paymentResult.gateway,
                method,
                externalId: paymentResult.paymentId,
                status: paymentResult.status,
                amount,
                userId,
                appointmentId,
                orderId,
                barbershopId,
                qrCode: paymentResult.qrCode,
                pixCopiaECola: paymentResult.pixCopiaECola
            }
        });

        return res.status(201).json({
            paymentId: payment.id,
            qrCode: payment.qrCode,
            pixCopiaECola: payment.pixCopiaECola,
            status: payment.status,
            externalId: payment.externalId
        });

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

        const paymentResult = await PaymentOrchestrator.createPayment({
            amount,
            method: 'PIX',
            description: `Agendamento #${appointment.id.slice(0, 8)}`,
            barbershopId: appointment.barbershopId,
            customer: {
                name: appointment.client.name,
                email: appointment.client.authUser?.email,
                phone: appointment.client.phone
            }
        });

        const payment = await prisma.payment.create({
            data: {
                gateway: paymentResult.gateway,
                method: 'PIX',
                externalId: paymentResult.paymentId,
                status: paymentResult.status,
                amount,
                userId: req.user.id,
                appointmentId: appointment.id,
                barbershopId: appointment.barbershopId,
                qrCode: paymentResult.qrCode,
                pixCopiaECola: paymentResult.pixCopiaECola
            }
        });

        return res.status(201).json({
            paymentId: payment.id,
            qrCode: payment.qrCode,
            pixCopiaECola: payment.pixCopiaECola,
            status: payment.status
        });
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
