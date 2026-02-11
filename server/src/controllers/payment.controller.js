const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TransactionService = require('../services/TransactionService');

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
                    pixCopiaECola: paymentResult.pixCopiaECola,
                    ticketUrl: paymentResult.ticketUrl // Add ticketUrl support
                }
            });

            return res.status(201).json({
                paymentId: updatedPayment.id,
                qrCode: updatedPayment.qrCode,
                qrCodeBase64: paymentResult.qrCodeBase64, // Pass ephemeral base64
                pixCopiaECola: updatedPayment.pixCopiaECola,
                ticketUrl: paymentResult.ticketUrl,
                status: updatedPayment.status,
                externalId: updatedPayment.externalId
            });
        } catch (gatewayError) {
            console.error('Gateway Error:', gatewayError);
            await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: { status: 'FAILED' }
            });
            return res.status(502).json({
                error: 'Erro no pagamento: ' + (gatewayError.message || 'Erro deconhecido')
            });
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

        // 1. Fetch Integration Data (Appointment + Service + Client + Fees)
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                barbershop: true,
                service: true,
                client: { include: { authUser: true } }
            }
        });

        if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado' });

        // 2. SECURITY: Recalculate Total Value (Backend Source of Truth)
        // Base Price
        let amount = Number(appointment.service.price);

        // Add Pending Fees (No-Show) if applicable logic exists
        // (Assuming checking pendingFees for this client/barbershop)
        // const pendingFees = await prisma.fee.findMany(...) -> amount += fee

        // Products: If appointment created via new flow, products might be linked separately or need to be passed strictly by ID to be summed here.
        // For now, focusing on Service Price which is the core request requirement.

        // Sanity Check: Ensure amount is valid
        if (amount <= 0) return res.status(400).json({ error: 'Valor inválido para pagamento' });

        // 3. Payer Info
        const payerUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { authUser: true }
        });

        // 4. Create PENDING Payment
        const pendingPayment = await prisma.payment.create({
            data: {
                gateway: 'PENDING',
                method: 'PIX',
                status: 'PENDING',
                amount: amount,
                userId: req.user.id,
                appointmentId: appointment.id,
                barbershopId: appointment.barbershopId
            }
        });

        try {
            // Customer Data
            const cpf = payerUser?.cpf || payerUser?.document || '';
            const customerData = {
                name: payerUser?.name || appointment.client.name || 'Cliente',
                email: payerUser?.authUser?.email || payerUser?.email || appointment.client.authUser?.email || 'email@naoinformado.com',
                phone: payerUser?.phone || appointment.client.phone || '00000000000',
                document: cpf.replace(/\D/g, '')
            };

            // 5. Call Gateway
            const paymentResult = await PaymentOrchestrator.createPayment({
                amount,
                method: 'PIX',
                description: `Agendamento #${appointment.id.slice(0, 8)} - ${appointment.service.name}`,
                barbershopId: appointment.barbershopId,
                customer: customerData,
                externalId: pendingPayment.id
            });

            // 6. Generate QR Code Image (Base64) if Gateway didn't return one
            // Most Pix APIs return the "EMV" string (Copia e Cola). We need to render it.
            let qrCodeBase64 = paymentResult.qrCodeBase64;
            const pixString = paymentResult.pixCopiaECola || paymentResult.qrCode;

            if (!qrCodeBase64 && pixString) {
                try {
                    const qrcode = require('qrcode');
                    qrCodeBase64 = await qrcode.toDataURL(pixString);
                    // Remove data:image/png;base64, prefix for consistency if needed, 
                    // or keep it. Let's keep strict base64 content if possible, or full DataURL.
                    // Usually frontend expects base64 content.
                    qrCodeBase64 = qrCodeBase64.split(',')[1];
                } catch (qrError) {
                    console.error('Failed to generate local QR Code:', qrError);
                }
            }

            // 7. Update Payment in DB
            const updatedPayment = await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    gateway: paymentResult.gateway,
                    externalId: paymentResult.paymentId,
                    status: paymentResult.status,
                    qrCode: pixString, // Save the String (EMV)
                    pixCopiaECola: pixString
                }
            });

            // 7.5 If Approved Immediately (e.g. Mock/Test), Register Transaction
            if (paymentResult.status === 'paid' || paymentResult.status === 'approved') {
                await TransactionService.createTransaction({
                    barbershopId: appointment.barbershopId,
                    amount: Number(amount),
                    method: 'PIX',
                    origin: 'ONLINE',
                    appointmentId: appointment.id,
                    description: `Pagamento Online (Pix) - Agendamento #${appointment.id.substring(0, 8)}`
                });
            }

            // 8. Return Success Payload
            return res.status(201).json({
                paymentId: updatedPayment.id,
                checkoutUrl: `/checkout-pix?id=${updatedPayment.id}`, // Internal Checkout Page
                qrCode: pixString,
                pixCopiaECola: pixString,
                qrCodeBase64: qrCodeBase64, // The Image
                status: updatedPayment.status,
                amount: amount,
                barbershopName: appointment.barbershop.name
            });

        } catch (gatewayError) {
            console.error('Gateway Error:', gatewayError);
            await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: { status: 'FAILED' }
            });
            return res.status(502).json({
                error: 'Erro Pix: ' + (gatewayError.message || 'Falha na comunicação')
            });
        }
    } catch (error) {
        console.error('Create Pix Error:', error);
        return res.status(500).json({ error: 'Erro ao gerar Pix' });
    }
};

exports.createCardPayment = async (req, res) => {
    try {
        const { appointmentId, token, issuerId, paymentMethodId, installments, payer, saveCard } = req.body;
        const userId = req.user.id; // Logged user

        if (!appointmentId || !token) {
            return res.status(400).json({ error: 'Missing required data (appointmentId, token)' });
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

        // Fetch User details for fallback
        const payerUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { authUser: true }
        });

        // 1. Create PENDING Payment in DB
        const pendingPayment = await prisma.payment.create({
            data: {
                gateway: 'PENDING',
                method: 'CREDIT_CARD', // or infer from paymentMethodId
                status: 'PENDING',
                amount: amount,
                userId: req.user.id,
                appointmentId: appointment.id,
                barbershopId: appointment.barbershopId
            }
        });

        const customerName = payerUser?.name || appointment.client.name || 'Cliente';
        const customerEmail = payerUser?.authUser?.email || payerUser?.email || appointment.client.authUser?.email || 'email@naoinformado.com';

        try {
            // 2. Call Payment Orchestrator (Mercado Pago / Stripe)
            const paymentResult = await PaymentOrchestrator.createPayment({
                amount,
                method: paymentMethodId?.includes('debit') ? 'DEBIT_CARD' : 'CREDIT_CARD',
                description: `Agendamento #${appointment.id.slice(0, 8)}`,
                barbershopId: appointment.barbershopId,
                customer: {
                    name: customerName,
                    email: customerEmail,
                    phone: payerUser?.phone || appointment.client.phone
                },
                externalId: pendingPayment.id,
                // Card Details
                token,
                installments: installments || 1,
                issuerId,
                paymentMethodId,
                payer: payer || { email: customerEmail }
            });

            // 3. Update Payment Record
            const updatedPayment = await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    gateway: paymentResult.gateway,
                    externalId: paymentResult.paymentId,
                    status: paymentResult.status
                }
            });

            // 4. If Approved, Confirm Appointment & Register Transaction
            if (paymentResult.status === 'paid' || paymentResult.status === 'approved') {
                await TransactionService.createTransaction({
                    barbershopId: appointment.barbershopId,
                    amount: Number(amount),
                    method: 'CREDIT_CARD',
                    origin: 'ONLINE',
                    appointmentId: appointment.id,
                    description: `Pagamento Online (Cartão) - Agendamento #${appointment.id.substring(0, 8)}`
                });

                // Status updated by TransactionService, but we can verify/log if needed.

                // 5. Automatic Card Saving Logic
                if (saveCard) {
                    try {
                        console.log(`[PaymentController] Auto-saving card for client ${appointment.clientId}`);

                        // Reuse the Orchestrator's saveCard wrapper
                        const savedCardData = await PaymentOrchestrator.saveCard({
                            barbershopId: appointment.barbershopId,
                            client: appointment.client,
                            token: token // This is the single-use token from frontend
                        });

                        // Store in DB for this specific shop context
                        await prisma.cardToken.create({
                            data: {
                                clientId: appointment.clientId,
                                gateway: savedCardData.gateway.toUpperCase(),
                                token: savedCardData.token, // This is the CARD_ID for future charges
                                last4: savedCardData.last4,
                                brand: savedCardData.brand,
                                expiryMonth: savedCardData.expiryMonth,
                                expiryYear: savedCardData.expiryYear,
                                barbershopId: appointment.barbershopId,
                                isDefault: false
                            }
                        });
                    } catch (saveError) {
                        console.error('[PaymentController] Failed to auto-save card:', saveError.message);
                        // Don't fail the payment if saving card fails
                    }
                }
            }

            return res.status(201).json({
                paymentId: updatedPayment.id,
                status: updatedPayment.status,
                externalId: updatedPayment.externalId
            });

        } catch (gatewayError) {
            console.error('Gateway Error (Card):', gatewayError);
            await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: { status: 'FAILED' }
            });
            return res.status(502).json({
                error: 'Falha no pagamento: ' + (gatewayError.message || 'Erro desconhecido')
            });
        }
    } catch (error) {
        console.error('Create Card Payment Error:', error);
        return res.status(500).json({ error: 'Erro interno ao processar cartão' });
    }
};

exports.createBrickPayment = async (req, res) => {
    try {
        // Payload from Brick
        const {
            transaction_amount,
            description,
            payment_method_id,
            payer,
            token,
            installments,
            issuer_id,
            barbershopId,
            appointmentId // Optional context
        } = req.body;

        const userId = req.user.id;

        if (!transaction_amount || !payment_method_id) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        // 1. Create Pending Payment in DB (if applicable)
        // If we have appointmentId, link it. If subscription, logic differs.
        let pendingPayment;
        if (appointmentId) {
            pendingPayment = await prisma.payment.create({
                data: {
                    gateway: 'PENDING',
                    method: payment_method_id,
                    status: 'PENDING',
                    amount: transaction_amount,
                    userId,
                    appointmentId,
                    barbershopId
                }
            });
        }

        // 2. Call Orchestrator
        // Map Brick payload to Orchestrator 'createPayment' params
        const paymentResult = await PaymentOrchestrator.createPayment({
            amount: transaction_amount,
            method: payment_method_id, // e.g. 'master', 'pix', 'bolbradesco'
            description: description || 'Payment via Brick',
            barbershopId,
            externalId: pendingPayment?.id, // Optional linkage

            // Card specific
            token,
            installments,
            issuerId: issuer_id,
            paymentMethodId: payment_method_id,

            // Payer
            payer, // Pass mostly raw payer object from Brick
            customer: {
                email: payer.email,
                name: payer.first_name ? `${payer.first_name} ${payer.last_name || ''}` : undefined
            }
        });

        // 3. Update DB if created
        if (pendingPayment) {
            await prisma.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    gateway: paymentResult.gateway,
                    externalId: paymentResult.paymentId,
                    status: paymentResult.status,
                    qrCode: paymentResult.qrCode,
                    pixCopiaECola: paymentResult.pixCopiaECola,
                    ticketUrl: paymentResult.ticketUrl
                }
            });
        }

        // 3.5 If Approved, Register Transaction
        if (paymentResult.status === 'paid' || paymentResult.status === 'approved') {
            await TransactionService.createTransaction({
                barbershopId,
                amount: Number(transaction_amount),
                method: payment_method_id === 'pix' ? 'PIX' : 'CREDIT_CARD', // Simple mapping
                origin: 'ONLINE',
                appointmentId: appointmentId || null,
                description: `Pagamento Online (Brick) - ${description || 'Venda'}`
            });
        }

        return res.status(201).json({
            id: paymentResult.paymentId,
            status: paymentResult.status,
            status_detail: paymentResult.statusDetail, // Useful for frontend messages
            qr_code_base64: paymentResult.qrCodeBase64,
            qr_code: paymentResult.pixCopiaECola,
            ticket_url: paymentResult.ticketUrl
        });

    } catch (error) {
        console.error('Create Brick Payment Error:', error);
        return res.status(500).json({
            error: 'Failed to process brick payment',
            details: error.message
        });
    }
};

exports.getPaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { barbershop: { select: { name: true, logoUrl: true } } } // Include context
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        let responseData = { ...payment };

        // Generate QR Code Base64 on-the-fly if missing but we have the payload
        if (payment.status === 'PENDING' && (payment.pixCopiaECola || payment.qrCode)) {
            try {
                const qrcode = require('qrcode');
                const pixString = payment.pixCopiaECola || payment.qrCode;
                // Generate Base64
                // We return as full Data URL or just content? Front expects base64 content usually or full src.
                // Let's return the content to match creation endpoint.
                const dataUrl = await qrcode.toDataURL(pixString);
                responseData.qrCodeBase64 = dataUrl.split(',')[1];
            } catch (err) {
                console.error('Failed to generate QR on getStatus:', err);
            }
        }

        return res.json(responseData);
    } catch (error) {
        console.error('Get Payment Status Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

exports.saveCard = async (req, res) => {
    try {
        const { token, barbershopId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role; // 'CLIENT', 'ADMIN', 'BARBER'

        if (!token) {
            return res.status(400).json({ error: 'Missing required data (token)' });
        }

        // barbershopId is now OPTIONAL. If missing, it's a GLOBAL card.

        let client;

        // 1. Resolve Client Profile based on Role
        if (userRole === 'CLIENT') {
            client = await prisma.client.findUnique({ where: { id: userId } });
            if (!client) return res.status(404).json({ error: 'Perfil de cliente não encontrado.' });
        } else {
            // It's a Pro (Admin/Barber) acting as a client
            // Try link via AuthUser
            client = await prisma.client.findFirst({
                where: { authUserId: req.user.authUserId }
            });

            // If Pro doesn't have a Client profile yet, create one
            if (!client) {
                const userProfile = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { authUser: true }
                });

                if (!userProfile) return res.status(404).json({ error: 'Perfil de usuário não encontrado.' });

                client = await prisma.client.create({
                    data: {
                        name: userProfile.name,
                        phone: userProfile.phone,
                        authUserId: userProfile.authUserId || undefined,
                        theme: 'dark'
                    }
                });
            }
        }

        // 2. Call Orchestrator
        try {
            const savedCardData = await PaymentOrchestrator.saveCard({
                barbershopId: barbershopId || null, // Explicit null if undefined
                client,
                token
            });

            // 3. Save CardToken in DB
            const cardToken = await prisma.cardToken.create({
                data: {
                    clientId: client.id,
                    gateway: savedCardData.gateway.toUpperCase(),
                    token: savedCardData.token, // MP Card ID
                    last4: savedCardData.last4,
                    brand: savedCardData.brand,
                    expiryMonth: savedCardData.expiryMonth,
                    expiryYear: savedCardData.expiryYear,
                    barbershopId: barbershopId || null, // Global if null
                    isDefault: false
                }
            });

            return res.status(201).json(cardToken);
        } catch (orchestratorError) {
            // Handle "Card already saved" or other MP errors gracefully?
            console.error('Orchestrator Save Error:', orchestratorError);
            return res.status(400).json({ error: orchestratorError.message || 'Falha ao salvar no gateway.' });
        }

    } catch (error) {
        console.error('Save Card Controller Error:', error);
        return res.status(500).json({ error: 'Falha interna ao salvar cartão: ' + error.message });
    }
};

exports.listCards = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { barbershopId } = req.query;

        // 1. Resolve Client
        let client;
        if (userRole === 'CLIENT') {
            client = await prisma.client.findUnique({ where: { id: userId } });
        } else {
            // Pro
            client = await prisma.client.findFirst({
                where: { authUserId: req.user.authUserId }
            });
        }

        if (!client) {
            return res.json([]); // No profile = no cards
        }

        // 2. Query Cards
        // Show cards for this specific shop OR Global cards (barbershopId: null)
        const where = {
            clientId: client.id,
            OR: [
                { barbershopId: null }, // Global Cards
            ]
        };

        if (barbershopId) {
            where.OR.push({ barbershopId: barbershopId });
        }

        const cards = await prisma.cardToken.findMany({
            where,
            include: {
                barbershop: { select: { name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // 3. Transform
        const sanitized = cards.map(c => ({
            id: c.id,
            brand: c.brand,
            last4: c.last4,
            expiry: `${c.expiryMonth}/${c.expiryYear}`,
            barbershopName: c.barbershop?.name || 'Carteira Global',
            isGlobal: !c.barbershopId,
            barbershopId: c.barbershopId,
            isDefault: c.isDefault
        }));

        return res.json(sanitized);

    } catch (error) {
        console.error('List Cards Error:', error);
        return res.status(500).json({ error: 'Erro ao listar cartões' });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Resolve Client
        let client;
        if (userRole === 'CLIENT') {
            client = await prisma.client.findUnique({ where: { id: userId } });
        } else {
            client = await prisma.client.findFirst({
                where: { authUserId: req.user.authUserId }
            });
        }

        if (!client) return res.status(404).json({ error: 'Perfil de cliente não encontrado' });

        // 2. Delete Card (Ensure it belongs to this client)
        const result = await prisma.cardToken.deleteMany({
            where: {
                id: id,
                clientId: client.id
            }
        });

        if (result.count === 0) {
            return res.status(404).json({ error: 'Cartão não encontrado ou não pertence a você' });
        }

        return res.json({ message: 'Cartão removido com sucesso' });

    } catch (error) {
        console.error('Delete Card Error:', error);
        return res.status(500).json({ error: 'Erro ao remover cartão' });
    }
};

exports.getPublicKey = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        // If no barbershopId, we return Platform Public Key

        // We can just ask Orchestrator. It handles null ID.
        const publicKey = await PaymentOrchestrator.getPublicKey(barbershopId || null);

        if (!publicKey) {
            return res.status(404).json({ error: 'Chave pública não encontrada' });
        }

        return res.json({
            gateway: 'MERCADOPAGO', // Default
            publicKey: publicKey
        });

    } catch (error) {
        console.error('Get Public Key Error:', error);
        return res.status(500).json({ error: 'Erro ao buscar chave pública' });
    }
};
