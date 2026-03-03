const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const googleCalendarService = require('../services/communication/GoogleCalendarService');
const axios = require('axios');
const { format, addMinutes, isBefore } = require('date-fns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saasPlans = require('../config/saasPlans');
const notificationController = require('../controllers/notification.controller');
const whatsappNotifier = require('../services/notificationService/whatsappNotifier');
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
const FeatureFlagService = require('../services/FeatureFlagService');
const TIMEZONE = 'America/Sao_Paulo';

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
            forma_pagamento,
            professionalId: cam_proId, serviceId: cam_serviceId, guestName: cam_guestName,
            guestPhone: cam_guestPhone, guestEmail: cam_guestEmail, date: cam_date,
            time: cam_time, paymentMethod: cam_payMethod
        } = req.body;

        // Unified Mapping (Supporting both Portuguese/Snake Case and English/camelCase)
        const professionalId = barbeiro_id || cam_proId;
        const guestName = cliente_nome || cam_guestName;
        const guestPhone = cliente_telefone || cam_guestPhone;
        const guestEmail = email || cam_guestEmail;
        const guestBirthday = data_nascimento;
        const createAccount = criar_conta;
        const password = senha;
        const reminderMinutes = lembrete_minutos;
        const isSqueezeIn = is_squeeze_in;
        const date = data || cam_date;
        const time = horario || cam_time;
        const paymentMethod = forma_pagamento || cam_payMethod;

        // Service Mapping
        let serviceId = cam_serviceId || (servicos && servicos.length > 0 ? servicos[0].servico_id : null);

        let clientId = req.user?.id || cliente_id; // Auth token or payload id
        let createdToken = null;
        let currentUser = null;

        // 1. Fetch Service & Pro details first to ensure they exist
        // Handle Multiple Services
        let servicesToBook = [];
        let primaryService = null;

        if (servicos && servicos.length > 0) {
            const allIds = servicos.map(s => s.servico_id);
            servicesToBook = await prisma.service.findMany({ where: { id: { in: allIds } } });
            if (servicesToBook.length === 0) return res.status(404).json({ message: 'Nenhum serviço válido encontrado.' });
            primaryService = servicesToBook[0]; // Logic: First one is primary for Appointment record
        } else if (serviceId) {
            const s = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!s) return res.status(404).json({ message: 'Serviço não encontrado' });
            servicesToBook = [s];
            primaryService = s;
        } else {
            return res.status(400).json({ message: 'Serviço é obrigatório' });
        }

        // Define 'service' variable for backward compatibility with rest of code that uses 'service'
        const service = primaryService;
        const barbershopId = service.barbershopId;

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

            // Check if Client exists by phone
            let existingClient = await prisma.client.findFirst({
                where: {
                    OR: [
                        { phone: phone },
                        { phone: guestPhone }
                    ]
                },
                include: { authUser: true }
            });

            if (createAccount) {
                if (!guestEmail || !password) {
                    return res.status(400).json({ message: 'Email e Senha são obrigatórios para criar conta.' });
                }

                // Check if AuthUser email exists
                const existingAuth = await prisma.authUser.findUnique({ where: { email: guestEmail } });
                if (existingAuth) {
                    return res.status(400).json({ message: 'Este email já está em uso. Faça login.' });
                }

                if (existingClient && existingClient.authUser) {
                    return res.status(400).json({ message: 'Este telefone já está vinculado a uma conta. Faça login.' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                // Transaction to create AuthUser + Client (or link existing Guest Client)
                const result = await prisma.$transaction(async (tx) => {
                    const authUser = await tx.authUser.create({
                        data: {
                            email: guestEmail,
                            password: hashedPassword,
                            provider: 'EMAIL'
                        }
                    });

                    let client;
                    if (existingClient) {
                        client = await tx.client.update({
                            where: { id: existingClient.id },
                            data: { authUserId: authUser.id, name: guestName, active: true }
                        });
                    } else {
                        client = await tx.client.create({
                            data: {
                                name: guestName,
                                phone: guestPhone,
                                authUserId: authUser.id,
                                theme: 'dark'
                            }
                        });
                    }
                    return { authUser, client };
                });

                clientId = result.client.id;
                currentUser = { ...result.client, email: result.authUser.email, role: 'CLIENT' };
                // Generate Token
                createdToken = jwt.sign(
                    { id: result.client.id, role: 'CLIENT', authUserId: result.authUser.id },
                    process.env.JWT_SECRET, { expiresIn: '30d' }
                );

            } else {
                // GUEST (No Account)
                if (!existingClient) {
                    existingClient = await prisma.client.create({
                        data: {
                            name: guestName,
                            phone: guestPhone,
                            // authUserId left null
                        }
                    });
                } else {
                    // Update info and ensure active
                    await prisma.client.update({
                        where: { id: existingClient.id },
                        data: { name: guestName || existingClient.name, active: true }
                    });
                }
                clientId = existingClient.id;
                currentUser = { ...existingClient, role: 'CLIENT' };
            }

            // SECURITY: Ensure this new/guest client is linked to the barbershop via CommunicationLog
            // This ensures they appear in the "Meus Clientes" list immediately.
            if (clientId && service && service.barbershopId) {
                // Fire and forget - don't block
                prisma.communicationLog.create({
                    data: {
                        barbershopId: service.barbershopId,
                        clientId: clientId,
                        channel: 'SYSTEM',
                        direction: 'INBOUND',
                        type: 'APPOINTMENT_CREATED',
                        content: 'Cliente criado/vinculado via Agendamento',
                        status: 'READ'
                    }
                }).catch(err => console.error('[AutoLink] Failed to create CommunicationLog:', err.message));
            }
        } else {
            // Fetch Authenticated Client
            const clientProfile = await prisma.client.findUnique({
                where: { id: clientId },
                include: { authUser: true }
            });
            if (clientProfile) {
                currentUser = { ...clientProfile, email: clientProfile.authUser?.email, role: 'CLIENT' };
            } else {
                // Fallback: Check if it's a Pro booking themselves (User table)
                const userProfile = await prisma.user.findUnique({ where: { id: clientId } });
                if (userProfile) {
                    currentUser = userProfile;
                }
            }
        }

        // 3. Robust Availability Check (Avoid Overbooking)
        const { addMinutes, isBefore, isAfter, parseISO } = require('date-fns');

        if (!date || !date.includes('-')) return res.status(400).json({ message: 'Data inválida.' });
        if (!time || !time.includes(':')) return res.status(400).json({ message: 'Horário inválido.' });

        // Construct ISO string for the requested time in SP
        const dateTimeString = `${date}T${time}:00`; // e.g., "2023-10-25T09:00:00"

        // Convert this SP time to UTC for storage/comparison
        // zonedTimeToUtc takes a string (treated as local calculation in that TZ) and returns UTC Date
        const appointmentDateTime = zonedTimeToUtc(dateTimeString, TIMEZONE);

        if (isNaN(appointmentDateTime.getTime())) {
            return res.status(400).json({ message: 'Data ou hora inválida.' });
        }

        // --- SAME DAY BUFFER VALIDATION (GATED) ---
        const bufferEnabled = await FeatureFlagService.isEnabled('booking_buffer', barbershopId);
        if (bufferEnabled) {
            const nowSP = utcToZonedTime(new Date(), TIMEZONE);
            const bufferTime = addMinutes(nowSP, 15);
            if (isBefore(appointmentDateTime, bufferTime)) {
                return res.status(400).json({
                    message: 'Não é possível agendar para um horário que já passou ou muito próximo do atual (mínimo 15 min de antecedência).'
                });
            }
        }
        // ----------------------------------

        // Calculate Total Duration
        const requestedDuration = servicesToBook.reduce((acc, curr) => acc + curr.duration, 0);

        const reqStart = appointmentDateTime;
        const reqEnd = new Date(reqStart.getTime() + requestedDuration * 60000);

        // Get the specific day of week relative to SP Timezone
        const zonedDate = utcToZonedTime(reqStart, TIMEZONE);
        const dayOfWeek = zonedDate.getDay(); // 0-6

        const schedule = pro.professionalProfile?.schedules.find(s => s.dayOfWeek === dayOfWeek);

        if (!schedule || schedule.isOff) {
            return res.status(400).json({ message: 'O profissional não atende neste dia.' });
        }

        // Helper: Create UTC Date from a time string "HH:MM" on the REQUESTED DATE (in SP context)
        const createZonedTime = (timeStr) => {
            return zonedTimeToUtc(`${date}T${timeStr}:00`, TIMEZONE);
        };

        const workStart = createZonedTime(schedule.startTime);
        const workEnd = createZonedTime(schedule.endTime);

        // Strict work hours check
        // Note: We use < and > to allow booking exactly at start time, but not ending exactly at end time if it pushes over?
        // Actually usually [Start, End) or [Start, End]. Let's match reqEnd <= workEnd.
        if (reqStart < workStart || reqEnd > workEnd) {
            return res.status(400).json({ message: 'Horário fora do expediente do profissional.' });
        }

        // Break Check
        if (schedule.breakStart && schedule.breakEnd) {
            const breakStart = createZonedTime(schedule.breakStart);
            const breakEnd = createZonedTime(schedule.breakEnd);

            // Overlap: Start < BreakEnd AND End > BreakStart
            if (reqStart < breakEnd && reqEnd > breakStart) {
                return res.status(400).json({ message: 'O horário selecionado conflita com o intervalo de pausa do profissional.' });
            }
        }

        // Existing Appointments Check
        // Range: Entire day in UTC corresponding to the SP day
        const dayStartUTC = zonedTimeToUtc(`${date}T00:00:00`, TIMEZONE);
        const dayEndUTC = zonedTimeToUtc(`${date}T23:59:59`, TIMEZONE);

        const dayAppointments = await prisma.appointment.findMany({
            where: {
                professionalId,
                date: {
                    gte: dayStartUTC,
                    lte: dayEndUTC
                },
                status: { not: 'CANCELLED' }
            },
            include: {
                service: true,
                order: {
                    include: {
                        items: {
                            include: { service: true }
                        }
                    }
                }
            }
        });

        const hasConflict = dayAppointments.some(app => {
            const appStart = new Date(app.date); // Postgres returns UTC

            // Calculate effective duration
            let appDuration = app.service?.duration || 30;
            if (app.order && app.order.items && app.order.items.length > 0) {
                const serviceItems = app.order.items.filter(i => i.type === 'SERVICE' && i.service);
                if (serviceItems.length > 0) {
                    appDuration = serviceItems.reduce((sum, item) => sum + (item.service.duration * item.quantity), 0);
                }
            }

            const appEnd = new Date(appStart.getTime() + appDuration * 60000);

            // Conflict: StartA < EndB && EndA > StartB
            return (reqStart < appEnd && reqEnd > appStart);
        });

        if (hasConflict) {
            if (isSqueezeIn) {
                console.log('Squeeze-in allowed despite conflict.');
            } else {
                return res.status(400).json({ message: 'Este horário já foi preenchido. Por favor, escolha outro.' });
            }
        }

        // 4. Create Appointment & Order via Transaction
        console.log(`[Transaction] Starting for Client: ${clientId}, Pro: ${professionalId}, Date: ${date} ${time}`);
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
                    paymentStatus: method === 'CASH' ? 'PENDING' : (method === 'SUBSCRIPTION' ? 'PAID' : 'PENDING'),
                    status: method === 'CASH' ? 'CONFIRMED' : (method === 'SUBSCRIPTION' ? 'CONFIRMED' : 'PENDING'),
                    isSqueezeIn: isSqueezeIn || false,
                    reminderMinutes: reminderMinutes ? parseInt(reminderMinutes) : null
                }
            });

            // --- PACKAGE / SUBSCRIPTION USAGE ---
            if (method === 'SUBSCRIPTION') {
                if (!clientId) throw new Error('Cliente não identificado para uso de assinatura.');

                // Fetch Active Subscription for this Barbershop
                // We look for any active subscription from this client in this shop
                const activeSub = await tx.clientSubscription.findFirst({
                    where: {
                        clientId: clientId,
                        plan: { barbershopId: service.barbershopId },
                        status: 'ACTIVE',
                        endDate: { gte: new Date() }
                    },
                    include: { plan: true },
                    orderBy: { endDate: 'desc' } // Get the one ending latest if multiple
                });

                if (!activeSub) {
                    throw new Error('Você não possui uma assinatura ativa nesta barbearia.');
                }

                // Check Cuts
                if (activeSub.remainingCuts <= 0) {
                    throw new Error('Você atingiu o limite de cortes do seu plano atual.');
                }

                // Update Subscription (Decrement Cuts)
                await tx.clientSubscription.update({
                    where: { id: activeSub.id },
                    data: {
                        remainingCuts: { decrement: 1 }
                    }
                });

                // Link Appointment to Subscription
                // We need to add `clientSubscriptionId` to Appointment if not already in data
                // The update to Appointment is tricky inside transaction after creation if we didn't pass it.
                // Actually, we can update the appointment instance or just rely on the side-effect.
                // Better: Update the appointment we just created to link it.
                await tx.appointment.update({
                    where: { id: appointment.id },
                    data: { clientSubscriptionId: activeSub.id }
                });
            }

            // Calculate Totals
            const serviceTotal = servicesToBook.reduce((sum, s) => sum + Number(s.price), 0);
            const productsTotal = productItems.reduce((sum, p) => sum + Number(p.price), 0);
            let totalVal = serviceTotal + productsTotal;

            // Check for Pending No-Show Fees
            const pendingFees = await tx.noShowRecord.findMany({
                where: { clientId, barbershopId: service.barbershopId, status: 'PENDING' }
            });

            if (pendingFees.length > 0) {
                for (const fee of pendingFees) {
                    totalVal += Number(fee.feeValue);
                    await tx.noShowRecord.update({
                        where: { id: fee.id },
                        data: { status: 'CHARGED' }
                    });
                }
            }

            // Create Order
            const order = await tx.order.create({
                data: {
                    appointmentId: appointment.id,
                    barbershopId: service.barbershopId,
                    clientId,
                    professionalId,
                    status: 'OPEN',
                    subtotal: totalVal,
                    total: totalVal,
                    paymentMethod: method,
                    paymentStatus: method === 'SUBSCRIPTION' ? 'PAID' : 'PENDING',
                    items: {
                        create: [
                            ...servicesToBook.map(s => ({
                                type: 'SERVICE',
                                serviceId: s.id,
                                quantity: 1,
                                unitPrice: Number(s.price),
                                total: Number(s.price)
                            })),
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
                                unitPrice: Number(fee.feeValue),
                                total: Number(fee.feeValue)
                            }))
                        ]
                    },
                    notes: pendingFees.length > 0 ? `Inclui taxa de não comparecimento: ${pendingFees.length}x` : null
                }
            });

            return { appointment, order };
        }, {
            maxWait: 5000,
            timeout: 20000
        });

        const { appointment, order } = result;

        // 5. Trigger Syncs (Best Effort)
        try {
            await googleCalendarService.syncAppointmentToGoogle(appointment.id);
        } catch (syncErr) {
            console.error('[Sync] Google Calendar Error:', syncErr.message);
        }

        // --- Notification Trigger (Professional) ---
        try {
            await notificationController.createNotification({
                userId: professionalId,
                title: 'Novo Agendamento',
                message: `Novo agendamento com ${currentUser?.name || guestName} para ${format(appointmentDateTime, 'dd/MM HH:mm')}`,
                type: 'appointment',
                appointmentId: appointment.id
            });
        } catch (e) {
            console.error('Falha ao criar notificação interna (Pro):', e.message);
        }

        // --- Notification for Client (In-App) ---
        if (clientId) {
            try {
                const targetUser = await prisma.user.findUnique({ where: { id: clientId } });
                if (targetUser) {
                    await notificationController.createNotification({
                        userId: clientId,
                        title: 'Agendamento Confirmado',
                        message: `Seu horário para ${service.name} está confirmado para ${format(appointmentDateTime, 'dd/MM HH:mm')}.`,
                        type: 'appointment',
                        appointmentId: appointment.id
                    });
                }
            } catch (e) { console.error('Falha ao notificar cliente:', e.message); }
        }

        // --- Event Driven Notification ---
        setImmediate(async () => {
            try {
                const fullApp = await prisma.appointment.findUnique({
                    where: { id: appointment.id },
                    include: { client: true, service: true, professional: true, barbershop: true }
                });

                if (fullApp) {
                    const eventBus = require('../services/events/eventBus');
                    eventBus.emit('APPOINTMENT_CREATED', fullApp);
                }
            } catch (err) {
                console.error('[EventBus] Failed to emit creation event:', err.message);
            }
        });
        // ---------------------------------

        const responseUser = currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role } : null;

        res.status(201).json({
            appointment_id: appointment.id,
            status: appointment.status === 'CONFIRMED' ? 'confirmado' : 'pendente',
            mensagem: appointment.status === 'CONFIRMED' ? 'Agendamento realizado com sucesso' : 'Agendamento pré-reservado. Aguardando pagamento.',
            order_id: order.id,
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
        const authUserId = req.user.authUserId;

        // If we have an authUserId (which we should for logged in users), 
        // find ALL client profiles linked to this account.
        // This handles legacy profiles created before registration.
        let clientIds = [userId];

        if (authUserId) {
            const allProfiles = await prisma.client.findMany({
                where: { authUserId },
                select: { id: true }
            });
            clientIds = allProfiles.map(p => p.id);
        }

        // As Client
        const bookings = await prisma.appointment.findMany({
            where: { clientId: { in: clientIds } },
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

exports.getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                client: { include: { authUser: { select: { email: true } } } },
                service: true,
                professional: { select: { id: true, name: true, avatarUrl: true } },
                barbershop: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        enabledPaymentMethods: true
                    }
                }
            }
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        res.json(appointment);
    } catch (error) {
        console.error('Error fetching appointment by ID:', error);
        res.status(500).json({ message: 'Erro interno ao buscar agendamento' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // CONFIRMED, COMPLETED, CANCELLED

        // 1. Fetch current appointment Check Security
        const curApp = await prisma.appointment.findUnique({ where: { id } });
        if (!curApp) return res.status(404).json({ message: 'Agendamento não encontrado' });

        // 2. Client Cancellation Logic
        if (req.user.role === 'CLIENT') {
            if (curApp.clientId !== req.user.id) {
                return res.status(403).json({ message: 'Você não tem permissão para alterar este agendamento.' });
            }
            if (status !== 'CANCELLED') {
                return res.status(400).json({ message: 'Clientes só podem cancelar agendamentos.' });
            }
        }

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

        // --- Emit Update Event for Automation ---
        const eventBus = require('../services/events/eventBus');
        eventBus.emit('APPOINTMENT_UPDATED', { appointment, oldStatus: curApp.status });
        // ----------------------------------------

        // HANDLE PAYMENT ON COMPLETION (If provided)
        if (status === 'COMPLETED' && req.body.paymentMethod && req.body.paymentMethod !== 'ONLINE') {
            // Create Payment Record for Local Payment
            const { paymentMethod, paidAmount } = req.body;
            const amount = paidAmount || appointment.service.price;

            // Check if already paid to avoid duplicates
            if (appointment.paymentStatus !== 'PAID') {
                // 1. Create Payment
                await prisma.payment.create({
                    data: {
                        gateway: 'MANUAL', // or LOCAL
                        method: paymentMethod, // CASH, CREDIT_CARD, DEBIT_CARD, PIX
                        status: 'paid',
                        amount: amount,
                        userId: appointment.clientId, // Client paying
                        barbershopId: appointment.barbershopId,
                        appointmentId: appointment.id,
                        orderId: appointment.order?.id, // If order exists
                        paidAt: new Date()
                    }
                });

                // 2. Update Appointment Payment Status
                await prisma.appointment.update({
                    where: { id: id },
                    data: {
                        paymentStatus: 'PAID',
                        paymentMethod: paymentMethod // Record final method used
                    }
                });

                // 2b. Sync Order Status
                if (appointment.order?.id) {
                    await prisma.order.update({
                        where: { id: appointment.order.id },
                        data: {
                            status: 'CLOSED',
                            paymentStatus: 'PAID',
                            paymentMethod: paymentMethod,
                            paidAt: new Date()
                        }
                    });
                }

                // 3. Create Transaction (Cash Flow)
                await prisma.transaction.create({
                    data: {
                        description: `Recebimento Agendamento #${appointment.id.slice(0, 6)}`,
                        amount: amount,
                        type: 'INCOME',
                        category: 'Serviço',
                        barbershopId: appointment.barbershopId,
                        appointmentId: appointment.id,
                        // date: defaults to now
                    }
                });
            }
        }

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

                // --- LOYALTY POINTS INCREMENT ---
                const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
                    where: { barbershopId: appointment.barbershopId }
                });

                if (loyaltyProgram && loyaltyProgram.active && appointment.clientId) {
                    const pointsToGain = Math.floor(Number(service.price) * (loyaltyProgram.pointsPerReal || 0));
                    if (pointsToGain > 0) {
                        await prisma.client.update({
                            where: { id: appointment.clientId },
                            data: {
                                points: { increment: pointsToGain }
                            }
                        });
                        console.log(`[Loyalty] Client ${appointment.clientId} gained ${pointsToGain} points.`);
                    }
                }
            } catch (err) {
                console.error('Error calculating commission:', err);
            }
        }

        // Trigger n8n on cancellation to notify waitlist
        if (status === 'CANCELLED') {
            // 1. Notify Professional (Interior)
            try {
                const appToNotify = await prisma.appointment.findUnique({
                    where: { id },
                    include: { client: true, service: true }
                });

                if (appToNotify && appToNotify.professionalId) {
                    await notificationController.createNotification({
                        userId: appToNotify.professionalId,
                        title: 'Agendamento Cancelado',
                        message: `O agendamento de ${appToNotify.client?.name || 'Cliente'} para ${format(new Date(appToNotify.date), 'HH:mm')} foi cancelado. O horário está liberado.`,
                        type: 'cancellation',
                        appointmentId: appToNotify.id
                    });
                }
            } catch (notifyErr) {
                console.error('Error notifying professional of cancellation:', notifyErr);
            }

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
                let fee = 0;

                if (percent > 0) {
                    fee = servicePrice * (percent / 100);
                }

                if (fee > 0) {
                    // Create pending no-show record
                    await prisma.noShowRecord.create({
                        data: {
                            clientId: appointment.clientId,
                            appointmentId: appointment.id,
                            barbershopId: appointment.barbershopId,
                            feeValue: fee,
                            status: 'PENDING'
                        }
                    });
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
        const fees = await prisma.noShowRecord.findMany({
            where: {
                clientId: req.user.id,
                status: 'PENDING'
            }
        });
        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fees' });
    }
};

exports.getUnreviewedAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const unreviewed = await prisma.appointment.findMany({
            where: {
                clientId: userId,
                status: 'COMPLETED',
                review: null
            },
            include: {
                service: true,
                professional: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });
        res.json(unreviewed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching unreviewed appointments' });
    }
};
