const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const { format } = require('date-fns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saasPlans = require('../config/saasPlans');
const notificationController = require('../controllers/notification.controller');
const whatsappNotifier = require('../services/notificationService/whatsappNotifier');
const PaymentOrchestrator = require('../services/payment/PaymentOrchestrator');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');
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
                    status: method === 'CASH' ? 'CONFIRMED' : (method === 'SUBSCRIPTION' ? 'CONFIRMED' : 'SCHEDULED'),
                    isSqueezeIn: isSqueezeIn || false,
                    reminderMinutes: reminderMinutes ? parseInt(reminderMinutes) : null
                }
            });

            // --- PACKAGE / SUBSCRIPTION USAGE ---
            if (method === 'SUBSCRIPTION') {
                if (!clientId) throw new Error('Cliente não identificado para uso de pacote.');
                const packageController = require('../controllers/package.controller');
                const usedPackage = await packageController.checkAndUsePackage(clientId, serviceId, service.barbershopId);
                if (!usedPackage) throw new Error('Você não possui créditos ativos neste pacote para este serviço.');

                await tx.packageUsage.create({
                    data: {
                        clientPackageId: usedPackage.id,
                        appointmentId: appointment.id
                    }
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
            status: paymentMethod === 'ONLINE' ? "pendente_pagamento" : "confirmado",
            mensagem: paymentMethod === 'ONLINE' ? "Agendamento realizado, aguardando pagamento" : "Agendamento realizado com sucesso",
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
