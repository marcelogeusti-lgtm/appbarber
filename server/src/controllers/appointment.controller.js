const prisma = require('../lib/prisma');
const financialService = require('../services/FinancialService');
const googleCalendarService = require('../services/communication/GoogleCalendarService');
const axios = require('axios');
const { format, addMinutes, isBefore } = require('date-fns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saasPlans = require('../config/saasPlans');
const notificationController = require('../controllers/notification.controller');
const whatsappNotifier = require('../services/notificationService/whatsappNotifier');
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const { zonedTimeToUtc, utcToZonedTime, formatInTimeZone } = require('date-fns-tz');
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

        let clientId = cliente_id;
        let createdToken = null;
        let currentUser = null;

        if (req.user) {
            // Find the correct Client profile for this logged-in user
            const authUserId = req.user.authUserId || (req.user.role === 'CLIENT' ? null : req.user.id);
            const clientProfile = await prisma.client.findFirst({
                where: {
                    OR: [
                        { id: req.user.id },
                        { authUserId: authUserId || req.user.authUserId || req.user.id }
                    ]
                },
                include: { authUser: true }
            });

            if (clientProfile) {
                clientId = clientProfile.id;
                currentUser = { ...clientProfile, email: clientProfile.authUser?.email, role: 'CLIENT' };
            } else {
                // Fallback: If no client profile yet, maybe it's a Pro booking
                const userProfile = await prisma.user.findUnique({ where: { id: req.user.id } });
                if (userProfile) {
                    currentUser = userProfile;
                }
            }
        }

        // 1. Fetch Service & Pro details first to ensure they exist
        let servicesToBook = [];
        let primaryService = null;

        if (servicos && servicos.length > 0) {
            const allIds = servicos.map(s => s.servico_id);
            servicesToBook = await prisma.service.findMany({ where: { id: { in: allIds } } });
            if (servicesToBook.length === 0) return res.status(404).json({ message: 'Nenhum serviço válido encontrado.' });
            primaryService = servicesToBook[0];
        } else if (serviceId) {
            const s = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!s) return res.status(404).json({ message: 'Serviço não encontrado' });
            servicesToBook = [s];
            primaryService = s;
        } else {
            return res.status(400).json({ message: 'Serviço é obrigatório' });
        }

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

            const phone = guestPhone.replace(/\D/g, '');

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

                const existingAuth = await prisma.authUser.findUnique({ where: { email: guestEmail } });
                if (existingAuth) {
                    return res.status(400).json({ message: 'Este email já está em uso. Faça login.' });
                }

                if (existingClient && existingClient.authUser) {
                    return res.status(400).json({ message: 'Este telefone já está vinculado a uma conta. Faça login.' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

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
                createdToken = jwt.sign(
                    { id: result.client.id, role: 'CLIENT', authUserId: result.authUser.id },
                    process.env.JWT_SECRET, { expiresIn: '30d' }
                );

            } else {
                if (!existingClient) {
                    existingClient = await prisma.client.create({
                        data: {
                            name: guestName,
                            phone: guestPhone,
                        }
                    });
                } else {
                    await prisma.client.update({
                        where: { id: existingClient.id },
                        data: { name: guestName || existingClient.name, active: true }
                    });
                }
                clientId = existingClient.id;
                currentUser = { ...existingClient, role: 'CLIENT' };
            }

            if (clientId && service && service.barbershopId) {
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
        }

        // 3. Robust Availability Check (Avoid Overbooking)
        if (!date || !date.includes('-')) return res.status(400).json({ message: 'Data inválida.' });
        if (!time || !time.includes(':')) return res.status(400).json({ message: 'Horário inválido.' });

        const dateTimeString = `${date}T${time}:00`;
        const appointmentDateTime = zonedTimeToUtc(dateTimeString, TIMEZONE);

        if (isNaN(appointmentDateTime.getTime())) {
            return res.status(400).json({ message: 'Data ou hora inválida.' });
        }

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

        const requestedDuration = servicesToBook.reduce((acc, curr) => acc + curr.duration, 0);
        const reqStart = appointmentDateTime;
        const reqEnd = new Date(reqStart.getTime() + requestedDuration * 60000);

        const zonedDate = utcToZonedTime(reqStart, TIMEZONE);
        const dayOfWeek = zonedDate.getDay();

        const schedule = pro.professionalProfile?.schedules.find(s => s.dayOfWeek === dayOfWeek);

        if (!schedule || schedule.isOff) {
            return res.status(400).json({ message: 'O profissional não atende neste dia.' });
        }

        const createZonedTime = (timeStr) => {
            return zonedTimeToUtc(`${date}T${timeStr}:00`, TIMEZONE);
        };

        const workStart = createZonedTime(schedule.startTime);
        const workEnd = createZonedTime(schedule.endTime);

        if (reqStart < workStart || reqEnd > workEnd) {
            return res.status(400).json({ message: 'Horário fora do expediente do profissional.' });
        }

        if (schedule.breakStart && schedule.breakEnd) {
            const breakStart = createZonedTime(schedule.breakStart);
            const breakEnd = createZonedTime(schedule.breakEnd);

            if (reqStart < breakEnd && reqEnd > breakStart) {
                return res.status(400).json({ message: 'O horário selecionado conflita com o intervalo de pausa do profissional.' });
            }
        }

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
            const appStart = new Date(app.date);
            let appDuration = app.service?.duration || 30;
            if (app.order && app.order.items && app.order.items.length > 0) {
                const serviceItems = app.order.items.filter(i => i.type === 'SERVICE' && i.service);
                if (serviceItems.length > 0) {
                    appDuration = serviceItems.reduce((sum, item) => sum + (item.service.duration * item.quantity), 0);
                }
            }
            const appEnd = new Date(appStart.getTime() + appDuration * 60000);
            return (reqStart < appEnd && reqEnd > appStart);
        });

        if (hasConflict && !isSqueezeIn) {
            return res.status(400).json({ message: 'Este horário já foi preenchido. Por favor, escolha outro.' });
        }

        const result = await prisma.$transaction(async (tx) => {
            let method = 'CASH';
            if (paymentMethod === 'SUBSCRIPTION') method = 'SUBSCRIPTION';
            else if (paymentMethod === 'ONLINE') method = 'ONLINE';

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

            if (method === 'SUBSCRIPTION') {
                if (!clientId) throw new Error('Cliente não identificado para uso de assinatura.');

                const activeSub = await tx.clientSubscription.findFirst({
                    where: {
                        clientId: clientId,
                        plan: { barbershopId: service.barbershopId },
                        status: 'ACTIVE',
                        endDate: { gte: new Date() }
                    },
                    include: { plan: true },
                    orderBy: { endDate: 'desc' }
                });

                if (!activeSub) throw new Error('Você não possui uma assinatura ativa nesta barbearia.');
                if (activeSub.remainingCuts <= 0) throw new Error('Você atingiu o limite de cortes do seu plano atual.');

                await tx.clientSubscription.update({
                    where: { id: activeSub.id },
                    data: { remainingCuts: { decrement: 1 } }
                });

                await tx.appointment.update({
                    where: { id: appointment.id },
                    data: { clientSubscriptionId: activeSub.id }
                });
            }

            const serviceTotal = servicesToBook.reduce((sum, s) => sum + Number(s.price), 0);
            const productsTotal = productItems.reduce((sum, p) => sum + Number(p.price), 0);
            let totalVal = serviceTotal + productsTotal;

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

        try {
            await googleCalendarService.syncAppointmentToGoogle(appointment.id);
        } catch (syncErr) {
            console.error('[Sync] Google Calendar Error:', syncErr.message);
        }

        setImmediate(async () => {
            try {
                const fullApp = await prisma.appointment.findUnique({
                    where: { id: appointment.id },
                    include: {
                        client: { include: { authUser: { select: { email: true } } } },
                        service: true,
                        professional: true,
                        barbershop: true,
                        order: {
                            include: {
                                items: {
                                    include: { product: true, service: true }
                                }
                            }
                        }
                    }
                });
                if (fullApp) {
                    const eventBus = require('../services/events/eventBus');
                    eventBus.emit('APPOINTMENT_CREATED', fullApp);
                }
            } catch (err) { console.error('EventBus Error:', err.message); }
        });

        res.status(201).json({
            appointment_id: appointment.id,
            status: appointment.status === 'CONFIRMED' ? 'confirmado' : 'pendente',
            mensagem: appointment.status === 'CONFIRMED' ? 'Agendamento realizado com sucesso' : 'Agendamento em processamento',
            order_id: order.id,
            appointment,
            order,
            token: createdToken,
            user: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.role } : null,
            isGuest: !req.user
        });
    } catch (error) {
        console.error('------- CRITICAL APPOINTMENT ERROR -------');
        console.error(error);
        res.status(500).json({ message: 'Erro interno ao processar agendamento.' });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const authUserId = req.user.authUserId || (req.user.role !== 'CLIENT' ? req.user.authUserId : null);

        console.log(`[DEBUG] getMyAppointments: RequestUserID=${userId}, Role=${req.user.role}, AuthUserID=${authUserId}`);

        let clientIds = [userId];

        // Ensure we fetch all linked client IDs for the user found via any route
        if (authUserId || userId) {
            const allProfiles = await prisma.client.findMany({
                where: {
                    OR: [
                        { authUserId: authUserId },
                        { id: userId },
                        { authUserId: userId } // Case where user.id is the authUserId
                    ]
                },
                select: { id: true, name: true }
            });
            const linkedIds = allProfiles.map(p => p.id);
            clientIds = [...new Set([...clientIds, ...linkedIds])];
        }

        console.log(`[DEBUG] Resolved ClientIDs for search: ${clientIds.join(', ')}`);

        // As Client
        const bookings = await prisma.appointment.findMany({
            where: { clientId: { in: clientIds } },
            include: {
                professional: { select: { name: true } },
                service: true,
                barbershop: true,
                review: true
            },
            orderBy: { date: 'desc' }
        });

        console.log(`[DEBUG] Found ${bookings.length} bookings for IDs: ${clientIds.join(', ')}`);

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
        const curApp = await prisma.appointment.findUnique({
            where: { id },
            include: { order: true }
        });
        if (!curApp) return res.status(404).json({ message: 'Agendamento não encontrado' });

        // --- SECURITY LOCK: PROTECT COMPLETED/PAID APPOINTMENTS ---
        // Once completed or paid, the appointment should be locked to prevent financial inconsistencies.
        if (curApp.status === 'COMPLETED' || curApp.paymentStatus === 'PAID') {
            // Only allow specialized adjustments if needed, but block basic status changes
            if (status !== curApp.status) {
                return res.status(403).json({
                    message: 'Este agendamento já foi concluído ou pago e está bloqueado para alterações de status. Contate o administrador para estornos.'
                });
            }
        }

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

        // --- FINANCIAL SYNC: HANDLE PAYMENT AND COMMISSIONS ON COMPLETION ---
        if (status === 'COMPLETED') {
            try {
                // Ensure payment is processed
                const paymentMethod = req.body.paymentMethod || appointment.paymentMethod || 'CASH';
                const paidAmount = req.body.paidAmount || Number(appointment.order?.total || appointment.service.price);

                await prisma.$transaction(async (tx) => {
                    // 1. Create Payment if not already PAID
                    if (appointment.paymentStatus !== 'PAID') {
                        await tx.payment.create({
                            data: {
                                gateway: 'MANUAL',
                                method: paymentMethod,
                                status: 'paid',
                                amount: paidAmount,
                                userId: appointment.clientId,
                                barbershopId: appointment.barbershopId,
                                appointmentId: appointment.id,
                                orderId: appointment.order?.id,
                                paidAt: new Date()
                            }
                        });

                        // 2. Update status in db
                        await tx.appointment.update({
                            where: { id: id },
                            data: { paymentStatus: 'PAID', paymentMethod }
                        });

                        if (appointment.order?.id) {
                            await tx.order.update({
                                where: { id: appointment.order.id },
                                data: {
                                    status: 'CLOSED',
                                    paymentStatus: 'PAID',
                                    paymentMethod,
                                    paidAt: new Date()
                                }
                            });
                        }

                        // 3. Central Transaction (Financial Engine)
                        await financialService.recordIncome({
                            amount: paidAmount,
                            description: `Recebimento: ${appointment.service.name} (#${appointment.id.slice(0, 6)})`,
                            category: 'Serviço',
                            barbershopId: appointment.barbershopId,
                            appointmentId: appointment.id,
                            orderId: appointment.order?.id,
                            professionalId: appointment.professionalId,
                            paymentMethod: paymentMethod,
                            origin: appointment.paymentMethod === 'ONLINE' ? 'ONLINE' : 'PRESENCIAL'
                        });
                    }

                    // 4. Process Commissions (Financial Engine)
                    // This will check each item in the order and create the respective commissions
                    await financialService.processCommissions(appointment.id, tx);
                });

                // --- LOYALTY POINTS (Optional) ---
                const loyaltyProgram = await prisma.loyaltyProgram.findUnique({
                    where: { barbershopId: appointment.barbershopId }
                });

                if (loyaltyProgram && loyaltyProgram.active && appointment.clientId) {
                    const pointsToGain = Math.floor(Number(appointment.service.price) * (loyaltyProgram.pointsPerReal || 0));
                    if (pointsToGain > 0) {
                        await prisma.client.update({
                            where: { id: appointment.clientId },
                            data: { points: { increment: pointsToGain } }
                        });
                    }
                }

            } catch (err) {
                console.error('[FinancialSync] Error processing completion:', err);
                // We don't want to crash the whole request if loyalty fails, but financial engine errors are tracked in logs
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
