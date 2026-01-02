const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const { format } = require('date-fns');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role, barbershopId: user.barbershopId || null },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.createAppointment = async (req, res) => {
    try {
        const { professionalId, serviceId, date, time, guestName, guestPhone, guestEmail, guestBirthday, products = [], paymentMethod, createAccount, password } = req.body;
        let clientId = req.user?.id;
        let createdToken = null;
        let currentUser = null;

        // 1. Fetch Service & Pro details first to ensure they exist
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return res.status(404).json({ message: 'Serviço não encontrado' });

        const pro = await prisma.user.findUnique({
            where: { id: professionalId },
            include: { professionalProfile: { include: { schedules: true } } }
        });
        if (!pro) return res.status(404).json({ message: 'Profissional não encontrado' });

        const productItems = products.length > 0
            ? await prisma.product.findMany({ where: { id: { in: products } } })
            : [];

        // 2. Guest Handling or Auto-Registration
        if (!clientId) {
            if (!guestName || !guestPhone) {
                return res.status(400).json({ message: 'Nome e Telefone são obrigatórios para agendamento' });
            }

            // Check if user exists by phone OR email (if email provided)
            let user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phone: guestPhone },
                        ...(guestEmail ? [{ email: guestEmail }] : [])
                    ]
                }
            });

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
                        phone: guestPhone,
                        email: guestEmail,
                        birthday: guestBirthday ? new Date(guestBirthday) : null,
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
                            birthday: guestBirthday ? new Date(guestBirthday) : null,
                            role: 'CLIENT',
                            password: null // No password for guest
                        }
                    });
                } else {
                    // Update missing optional info if provided
                    const updates = {};
                    if (guestEmail && !user.email) updates.email = guestEmail;
                    if (guestBirthday && !user.birthday) updates.birthday = new Date(guestBirthday);
                    if (guestName && user.name !== guestName) updates.name = guestName; // Keep name updated

                    if (Object.keys(updates).length > 0) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: updates
                        });
                    }
                }
            }
            clientId = user.id;
            currentUser = user;
        } else {
            currentUser = await prisma.user.findUnique({ where: { id: clientId } });
        }

        // 3. Robust Availability Check (Avoid Overbooking)
        // Parse requested date/time
        const [year, month, day] = date.split('-').map(Number);
        const [hour, min] = time.split(':').map(Number);
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

        // Check against professional's break (Lunch)
        if (schedule.breakStart && schedule.breakEnd) {
            const [bSH, bSM] = schedule.breakStart.split(':').map(Number);
            const [bEH, bEM] = schedule.breakEnd.split(':').map(Number);
            const breakStart = new Date(year, month - 1, day, bSH, bSM, 0);
            const breakEnd = new Date(year, month - 1, day, bEH, bEM, 0);

            // Overlap check
            if (reqStart < breakEnd && reqEnd > breakStart) {
                return res.status(400).json({ message: 'O horário selecionado conflita com o intervalo de pausa do profissional.' });
            }
        }

        // Check against existing appointments
        // Double check all appointments of the day for specific overlap
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
            return res.status(400).json({ message: 'Este horário já foi preenchido. Por favor, escolha outro.' });
        }

        const appointmentDateTime = reqStart; // Use the validated date object

        // 4. Create Appointment & Order via Transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Map payment method
            let method = 'CASH';
            if (paymentMethod === 'SUBSCRIPTION') method = 'SUBSCRIPTION';
            else if (paymentMethod === 'ONLINE') method = 'ONLINE';

            // Create Appointment
            const appointment = await prisma.appointment.create({
                data: {
                    date: appointmentDateTime,
                    clientId,
                    professionalId,
                    serviceId,
                    barbershopId: service.barbershopId,
                    paymentMethod: method,
                    paymentStatus: 'PENDING'
                }
            });

            // Calculate Totals
            const serviceTotal = Number(service.price);
            const productsTotal = productItems.reduce((sum, p) => sum + Number(p.price), 0);
            const total = serviceTotal + productsTotal;

            // Create Order
            const order = await prisma.order.create({
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
                            }))
                        ]
                    }
                }
            });

            return { appointment, order };
        });

        const { appointment, order } = result;

        // Trigger n8n Webhook (Async, don't block response)
        const barbershop = await prisma.barbershop.findUnique({ where: { id: service.barbershopId } });
        const webhookUrl = barbershop?.webhookUrl;

        if (webhookUrl) {
            axios.post(webhookUrl, {
                event: 'appointment.created',
                data: {
                    id: appointment.id,
                    date: date,
                    time: time,
                    clientName: currentUser?.name || guestName,
                    clientPhone: currentUser?.phone || guestPhone,
                    serviceName: service.name,
                    products: productItems.map(p => p.name).join(', '),
                    totalValue: order.total,
                    paymentMethod
                }
            }).catch(e => console.error('Webhook Error:', e.message));
        }

        const responseUser = currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role } : null;
        res.status(201).json({ appointment, order, token: createdToken, user: responseUser, isGuest: !req.user });
    } catch (error) {
        console.error('CREATE APPOINTMENT ERROR:', error);
        res.status(500).json({ message: 'Server error' });
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
            where: { id },
            data: { status },
            include: { client: true, service: true, professional: true }
        });

        // Trigger n8n on cancellation to notify waitlist
        if (status === 'CANCELLED') {
            const barbershop = await prisma.barbershop.findUnique({ where: { id: appointment.barbershopId } });
            const webhookUrl = barbershop?.webhookUrl;

            if (webhookUrl) {
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

        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating status' });
    }
};
