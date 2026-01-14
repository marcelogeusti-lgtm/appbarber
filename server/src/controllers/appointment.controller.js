const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const { format } = require('date-fns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saasPlans = require('../config/saasPlans');
const notificationController = require('../controllers/notification.controller');
const whatsappNotifier = require('../services/notificationService/whatsappNotifier');


const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role, barbershopId: user.barbershopId || null },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.createAppointment = async (req, res) => {
    try {
        // Mapping Snake Case Payload to Internal Variables
        const {
            cliente_id, cliente_nome, cliente_telefone, email, data_nascimento,
            barbeiro_id, servicos, produtos = [],
            data, horario,
            criar_conta, senha,
            lembrete_minutos, is_squeeze_in,
            forma_pagamento
        } = req.body;

        // Legacy/Internal mapping
        const professionalId = barbeiro_id;
        // Assuming single service selection for now as per schema logic, taking the first one
        const serviceId = servicos && servicos.length > 0 ? servicos[0].servico_id : null;
        const guestName = cliente_nome;
        const guestPhone = cliente_telefone;
        const guestEmail = email;
        const guestBirthday = data_nascimento;
        const createAccount = criar_conta;
        const password = senha;
        const reminderMinutes = lembrete_minutos;
        const isSqueezeIn = is_squeeze_in;
        // Fix: Map Portuguese payload to internal English variables
        const date = data;
        const time = horario;
        const paymentMethod = forma_pagamento;

        let clientId = req.user?.id || cliente_id; // Auth token or payload id
        let createdToken = null;
        let currentUser = null;

        // 1. Fetch Service & Pro details first to ensure they exist
        if (!serviceId) return res.status(400).json({ message: 'Serviço é obrigatório' });
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return res.status(404).json({ message: 'Serviço não encontrado' });

        const pro = await prisma.user.findUnique({
            where: { id: professionalId },
            include: { professionalProfile: { include: { schedules: true } } }
        });
        if (!pro) return res.status(404).json({ message: 'Profissional não encontrado' });

        const productIds = produtos.map(p => p.produto_id || p);
        const productItems = productIds.length > 0
            ? await prisma.product.findMany({ where: { id: { in: productIds } } })
            : [];

        // 2. Guest Handling or Auto-Registration
        if (!clientId) {
            if (!guestName || !guestPhone) {
                return res.status(400).json({ message: 'Nome e Telefone são obrigatórios para agendamento' });
            }

            // Normalize phone
            const phone = guestPhone.replace(/\D/g, '');

            // Check if user exists by phone OR email (if email provided)
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phone: phone }, // Match sanitized phone
                        { phone: guestPhone }, // Match raw phone just in case
                        ...(guestEmail ? [{ email: guestEmail }] : [])
                    ]
                }
            });

            const validBirthday = guestBirthday && guestBirthday.trim() !== '' ? new Date(guestBirthday) : null;

            if (createAccount) {
                if (!guestEmail || !password) {
                    return res.status(400).json({ message: 'Email e Senha são obrigatórios para criar conta.' });
                }
                if (user) {
                    return res.status(400).json({ message: 'Um usuário com este telefone ou email já existe. Faça login.' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                user = await prisma.user.create({
                    data: {
                        name: guestName,
                        phone: guestPhone, // Save as provided or sanitized? Keeping provided for display formatting
                        email: guestEmail,
                        birthday: validBirthday,
                        role: 'CLIENT',
                        password: hashedPassword
                    }
                });
                createdToken = generateToken(user);
            } else {
                // Determine if we need to create a GUEST user (no auth) or use existing
                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            name: guestName,
                            phone: guestPhone,
                            email: guestEmail || null,
                            birthday: validBirthday,
                            role: 'CLIENT',
                            password: null // No password for guest
                        }
                    });
                } else {
                    // Update missing optional info if provided
                    const updates = {};
                    if (guestEmail && !user.email) updates.email = guestEmail;
                    if (validBirthday && !user.birthday) updates.birthday = validBirthday;
                    if (guestName && user.name !== guestName) updates.name = guestName; // Keep name updated

                    if (Object.keys(updates).length > 0) {
                        try {
                            await prisma.user.update({
                                where: { id: user.id },
                                data: updates
                            });
                        } catch (e) {
                            console.warn('Failed to update existing user info:', e.message);
                        }
                    }
                }
            }
            clientId = user.id;
            currentUser = user;
        } else {
            currentUser = await prisma.user.findUnique({ where: { id: clientId } });
        }

        // 3. Robust Availability Check (Avoid Overbooking)
        if (!date || !date.includes('-')) return res.status(400).json({ message: 'Data inválida.' });
        if (!time || !time.includes(':')) return res.status(400).json({ message: 'Horário inválido.' });

        // Parse requested date/time
        const [year, month, day] = date.split('-').map(Number);
        const [hour, min] = time.split(':').map(Number);

        if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(min)) {
            return res.status(400).json({ message: 'Formato de data ou hora inválido.' });
        }

        const reqStart = new Date(year, month - 1, day, hour, min, 0);
        const reqEnd = new Date(reqStart.getTime() + service.duration * 60000);

        // Check if day is on/off
        const dayOfWeek = reqStart.getDay();
        const schedule = pro.professionalProfile?.schedules.find(s => s.dayOfWeek === dayOfWeek);

        if (!schedule || schedule.isOff) {
            return res.status(400).json({ message: 'O profissional não atende neste dia.' });
        }

        // Check against work hours
        const [wSH, wSM] = schedule.startTime.split(':').map(Number);
        const [wEH, wEM] = schedule.endTime.split(':').map(Number);
        const workStart = new Date(year, month - 1, day, wSH, wSM, 0);
        const workEnd = new Date(year, month - 1, day, wEH, wEM, 0);

        if (reqStart < workStart || reqEnd > workEnd) {
            return res.status(400).json({ message: 'Horário fora do expediente do profissional.' });
        }

        // Check against professional's break
        if (schedule.breakStart && schedule.breakEnd) {
            const [bSH, bSM] = schedule.breakStart.split(':').map(Number);
            const [bEH, bEM] = schedule.breakEnd.split(':').map(Number);
            const breakStart = new Date(year, month - 1, day, bSH, bSM, 0);
            const breakEnd = new Date(year, month - 1, day, bEH, bEM, 0);

            if (reqStart < breakEnd && reqEnd > breakStart) {
                return res.status(400).json({ message: 'O horário selecionado conflita com o intervalo de pausa do profissional.' });
            }
        }

        // Check against existing appointments
        const dayAppointments = await prisma.appointment.findMany({
            where: {
                professionalId,
                date: {
                    gte: new Date(year, month - 1, day, 0, 0, 0),
                    lte: new Date(year, month - 1, day, 23, 59, 59)
                },
                status: { not: 'CANCELLED' }
            },
            include: { service: true }
        });

        const hasConflict = dayAppointments.some(app => {
            const appStart = new Date(app.date);
            const appEnd = new Date(appStart.getTime() + app.service.duration * 60000);
            return (reqStart < appEnd && reqEnd > appStart);
        });

        if (hasConflict) {
            if (isSqueezeIn) {
                console.log('Squeeze-in allowed despite conflict.');
            } else {
                return res.status(400).json({ message: 'Este horário já foi preenchido. Por favor, escolha outro.' });
            }
        }

        const appointmentDateTime = reqStart; // Use the validated date object

        // 4. Create Appointment & Order via Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Map payment method
            let method = 'CASH';
            if (paymentMethod === 'SUBSCRIPTION') method = 'SUBSCRIPTION';
            else if (paymentMethod === 'ONLINE') method = 'ONLINE';

            // Create Appointment
            const appointment = await tx.appointment.create({
                data: {
                    date: appointmentDateTime,
                    clientId,
                    professionalId,
                    serviceId,
                    barbershopId: service.barbershopId,
                    paymentMethod: method,
                    // If method is CASH (Local), we immediately CONFIRM it because we trust the user showing up (or use No-Show fees).
                    // If ONLINE, it might be PENDING until payment webhook.
                    // Request says: "Ao finalizar ... O status deve ser: Confirmado"
                    paymentStatus: method === 'CASH' ? 'PENDING' : (method === 'SUBSCRIPTION' ? 'PAID' : 'PENDING'),
                    status: method === 'CASH' ? 'CONFIRMED' : (method === 'SUBSCRIPTION' ? 'CONFIRMED' : 'SCHEDULED'), // Subscription is instant confirmed
                    isSqueezeIn: isSqueezeIn || false,
                    reminderMinutes: reminderMinutes ? parseInt(reminderMinutes) : null
                }
            });

            // --- PACKAGE / SUBSCRIPTION USAGE ---
            if (method === 'SUBSCRIPTION') {
                if (!clientId) throw new Error('Cliente não identificado para uso de pacote.');

                // We need to require packageController here (avoid circular dependency if top-level)
                const packageController = require('../controllers/package.controller');

                // Determine effective service ID (mapped variable)
                // We already have 'serviceId' in scope.

                const usedPackage = await packageController.checkAndUsePackage(clientId, serviceId, service.barbershopId);

                if (!usedPackage) {
                    // If we are inside a transaction, throwing error rolls it back.
                    throw new Error('Você não possui créditos ativos neste pacote para este serviço.');
                }

                // Link usage to appointment
                await tx.packageUsage.create({
                    data: {
                        clientPackageId: usedPackage.id,
                        appointmentId: appointment.id
                    }
                });

                console.log(`[Package] Used 1 credit from Package ${usedPackage.package.name} for Client ${clientId}`);
            }
            // ------------------------------------

            // --- Notification Trigger ---
            // Notify Professional
            // Wrap in safe catch to not block transaction? No, notifications are critical enough but shouldn't rollback DB.
            // Moving outside transaction usually better, but for now inside is fine or just ignore error.
            try {
                await notificationController.createNotification({
                    userId: professionalId,
                    title: 'Novo Agendamento',
                    message: `Novo agendamento com ${currentUser?.name || guestName} para ${format(appointmentDateTime, 'dd/MM HH:mm')}`,
                    type: 'appointment',
                    appointmentId: appointment.id
                });
            } catch (e) {
                console.error('Falha ao criar notificação interna:', e.message);
            }
            // ----------------------------

            // --- Notification for Client (In-App) ---
            if (clientId) {
                try {
                    await notificationController.createNotification({
                        userId: clientId,
                        title: 'Agendamento Confirmado',
                        message: `Seu horário para ${service.name} está confirmado para ${format(appointmentDateTime, 'dd/MM HH:mm')}.`,
                        type: 'appointment',
                        appointmentId: appointment.id
                    });
                } catch (e) { console.error('Falha ao notificar cliente:', e.message); }
            }

            // Calculate Totals
            const serviceTotal = Number(service.price);
            const productsTotal = productItems.reduce((sum, p) => sum + Number(p.price), 0);
            let total = serviceTotal + productsTotal;

            // Check for Pending No-Show Fees
            const pendingFees = await tx.noShowRecord.findMany({
                where: {
                    clientId,
                    barbershopId: service.barbershopId,
                    status: 'PENDING'
                }
            });

            let feeTotal = 0;
            const feeItems = [];

            if (pendingFees.length > 0) {
                for (const fee of pendingFees) {
                    feeTotal += fee.feeValue;
                    // Mark fee as CHARGED (or associated to this order)
                    // Currently NoShowRecord logic is simple. Let's mark it CHARGED.
                    // Ideally we should link it to the Order to track payment, but keeping it simple as requested.
                    await tx.noShowRecord.update({
                        where: { id: fee.id },
                        data: { status: 'CHARGED' }
                    });
                }
                total += feeTotal;
            }

            // Create Order
            // Wait, OrderItem table:
            // type String
            // serviceId?
            // productId?
            // If I create an item without ID, frontend needs to handle it.
            // Let's check OrderItem schema: type is String.
            // Let's use type='NO_SHOW_FEE' and handle frontend display.

            const order = await tx.order.create({
                data: {
                    appointmentId: appointment.id,
                    barbershopId: service.barbershopId,
                    clientId,
                    professionalId,
                    status: 'OPEN',
                    subtotal: total,
                    total: total,
                    paymentMethod: method,
                    items: {
                        create: [
                            {
                                type: 'SERVICE',
                                serviceId: service.id,
                                quantity: 1,
                                unitPrice: Number(service.price),
                                total: Number(service.price)
                            },
                            ...productItems.map(p => ({
                                type: 'PRODUCT',
                                productId: p.id,
                                quantity: 1,
                                unitPrice: Number(p.price),
                                total: Number(p.price)
                            })),
                            ...pendingFees.map(fee => ({
                                type: 'NO_SHOW_FEE',
                                quantity: 1,
                                unitPrice: fee.feeValue,
                                total: fee.feeValue
                            }))
                        ]
                    },
                    notes: pendingFees.length > 0 ? `Inclui taxa de não comparecimento: ${pendingFees.length}x` : null
                }
            });

            return { appointment, order };
        }, {
            maxWait: 5000, // default: 2000
            timeout: 20000 // default: 5000
        });


        const { appointment, order } = result;

        // --- NEW: WhatsApp Notification (Decoupled & Safe) ---
        setImmediate(async () => {
            try {
                const fullApp = await prisma.appointment.findUnique({
                    where: { id: appointment.id },
                    include: { client: true, service: true, professional: true, barbershop: true }
                });

                if (fullApp) {
                    await whatsappNotifier.sendConfirmation(fullApp);
                }
            } catch (err) {
                console.error('[AUTO] Notification Failed:', err.message);
            }
        });
        // -----------------------------------------------------

        // Trigger n8n Webhook (Async, don't block response)
        const barbershop = await prisma.barbershop.findUnique({ where: { id: service.barbershopId } });
        const webhookUrl = barbershop?.webhookUrl;

        const userPlan = barbershop?.saasPlan || 'BASIC';
        const planConfig = saasPlans[userPlan] || saasPlans.BASIC;
        const hasWebhookFeature = planConfig.features.includes('all') || planConfig.features.includes('webhook');

        if (webhookUrl && hasWebhookFeature) {
            axios.post(webhookUrl, {
                event: 'appointment.created',
                data: {
                    id: appointment.id,
                    date: data, // Using mapped variable
                    time: horario, // Using mapped variable
                    clientName: currentUser?.name || guestName,
                    clientPhone: currentUser?.phone || guestPhone,
                    serviceName: service.name,
                    products: productItems.map(p => p.name).join(', '),
                    totalValue: order.total,
                    paymentMethod: req.body.forma_pagamento
                }
            }).catch(e => console.error('Webhook Error:', e.message));
        }

        const responseUser = currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role } : null;
        res.status(201).json({
            appointment_id: appointment.id,
            status: "confirmado",
            mensagem: "Agendamento realizado com sucesso",
            // Keeping original fields just in case frontend needs them for now, but following success spec
            appointment,
            order,
            token: createdToken,
            user: responseUser,
            isGuest: !req.user
        });
    } catch (error) {
        // Detailed logging
        console.error('------- CRITICAL APPOINTMENT ERROR -------');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        if (error.code) console.error('Prisma Code:', error.code);
        if (error.meta) console.error('Prisma Meta:', error.meta);
        console.error('------------------------------------------');

        res.status(500).json({
            message: 'Ocorreu um erro interno ao processar seu agendamento. Por favor, tente novamente ou contate o suporte.',
            debug: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        // As Client
        const bookings = await prisma.appointment.findMany({
            where: { clientId: userId },
            include: { professional: { select: { name: true } }, service: true, barbershop: true },
            orderBy: { date: 'desc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};

exports.getProAppointments = async (req, res) => {
    try {
        // Check if user is Pro
        const bookings = await prisma.appointment.findMany({
            where: { professionalId: req.user.id },
            include: { client: { select: { name: true, phone: true } }, service: true },
            orderBy: { date: 'asc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};

// Admin: Get ALL Appointments for Barbershop
exports.getAllAppointments = async (req, res) => {
    try {
        const { barbershopId, start, end } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const where = { barbershopId };

        // Optional Date Filtering
        if (start && end) {
            where.date = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }

        const bookings = await prisma.appointment.findMany({
            where,
            include: {
                client: { select: { name: true, phone: true } },
                service: true,
                professional: { select: { id: true, name: true } }
            },
            orderBy: { date: 'asc' }
        });

        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all appointments' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // CONFIRMED, COMPLETED, CANCELLED

        const appointment = await prisma.appointment.update({
            where: { id: id },
            data: { status: status },
            include: {
                client: true,
                service: {
                    include: {
                        commissionOverrides: true
                    }
                },
                professional: true
            }
        });

        // Trigger Commission Calculation on COMPLETED
        if (status === 'COMPLETED') {
            try {
                const service = appointment.service;
                const proId = appointment.professionalId;
                const servicePrice = Number(service.price);

                // Check for override
                const override = service.commissionOverrides?.find(o => o.professionalId === proId);

                let commType = override ? override.type : service.commissionType;
                let commValue = override ? Number(override.value) : Number(service.commissionValue);

                let calculatedAmount = 0;
                if (commType === 'PERCENTAGE') {
                    calculatedAmount = servicePrice * (commValue / 100);
                } else {
                    calculatedAmount = commValue;
                }

                // Check if commission already exists for this appointment
                const existingComm = await prisma.commission.findFirst({
                    where: { appointmentId: id }
                });

                if (!existingComm && calculatedAmount > 0) {
                    await prisma.commission.create({
                        data: {
                            barberId: proId,
                            barbershopId: appointment.barbershopId,
                            appointmentId: id,
                            type: 'SERVICE',
                            description: `Comissão: ${service.name} (${appointment.client?.name})`,
                            amount: calculatedAmount,
                            percentage: commType === 'PERCENTAGE' ? commValue : null,
                            status: 'PENDING'
                        }
                    });
                }
            } catch (err) {
                console.error('Error calculating commission:', err);
            }
        }

        // Trigger n8n on cancellation to notify waitlist
        if (status === 'CANCELLED') {
            const barbershop = await prisma.barbershop.findUnique({ where: { id: appointment.barbershopId } });
            const webhookUrl = barbershop?.webhookUrl;

            const userPlan = barbershop?.saasPlan || 'BASIC';
            const planConfig = saasPlans[userPlan] || saasPlans.BASIC;
            const hasWebhookFeature = planConfig.features.includes('all') || planConfig.features.includes('webhook');

            if (webhookUrl && hasWebhookFeature) {
                axios.post(webhookUrl, {
                    event: 'appointment.cancelled',
                    data: {
                        id: appointment.id,
                        date: format(new Date(appointment.date), 'yyyy-MM-dd'),
                        time: format(new Date(appointment.date), 'HH:mm'),
                        clientName: appointment.client?.name,
                        clientPhone: appointment.client?.phone,
                        serviceName: appointment.service?.name,
                        barbershopId: appointment.barbershopId
                    }
                }).catch(e => console.error('Cancellation Webhook Error:', e.message));
            }
        }

        // Handle NO_SHOW logic
        if (status === 'NO_SHOW') {
            const barbershop = await prisma.barbershop.findUnique({ where: { id: appointment.barbershopId } });

            if (barbershop && barbershop.noShowEnabled) {
                const servicePrice = Number(appointment.service.price);
                const percent = barbershop.noShowPercent || 0;
                const feeValue = servicePrice * (percent / 100);

                // Create NoShowRecord if not exists for this appointment
                const existingRecord = await prisma.noShowRecord.findUnique({
                    where: { appointmentId: appointment.id }
                });

                if (!existingRecord && feeValue > 0) {
                    await prisma.noShowRecord.create({
                        data: {
                            clientId: appointment.clientId,
                            appointmentId: appointment.id,
                            barbershopId: appointment.barbershopId,
                            percentage: percent,
                            baseValue: servicePrice,
                            feeValue: feeValue,
                            status: 'PENDING'
                        }
                    });
                    console.log(`No-Show Fee Recorded: Client ${appointment.clientId}, Fee RS ${feeValue}`);
                }
            }
        }

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status' });
    }
};

exports.getPendingFees = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        const userId = req.user.id;

        const fees = await prisma.noShowRecord.findMany({
            where: {
                clientId: userId,
                barbershopId: barbershopId,
                status: 'PENDING'
            }
        });

        res.json(fees);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching fees' });
    }
};
