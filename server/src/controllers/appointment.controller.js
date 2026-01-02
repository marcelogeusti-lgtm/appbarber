const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const { format } = require('date-fns');


exports.createAppointment = async (req, res) => {
    try {
        const { professionalId, serviceId, date, time, guestName, guestPhone, guestEmail, guestBirthday } = req.body; // date: YYYY-MM-DD, time: HH:mm
        let clientId = req.user?.id; // If logged in

        // Guest Handling
        if (!clientId) {
            if (!guestName || !guestPhone) {
                return res.status(400).json({ message: 'Nome e Telefone são obrigatórios para agendamento' });
            }

            // Check if user exists by phone
            let user = await prisma.user.findUnique({ where: { phone: guestPhone } });

            if (!user) {
                // Create new Guest User
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
            clientId = user.id;
        }

        const appointmentDateTime = new Date(`${date}T${time}:00Z`);

        // 1. Check if Professional Exists
        const pro = await prisma.user.findUnique({
            where: { id: professionalId },
            include: { professionalProfile: { include: { schedules: true } } }
        });

        if (!pro) return res.status(404).json({ message: 'Professional not found' });

        // 2. Check Service Duration
        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return res.status(404).json({ message: 'Service not found' });

        // 3. Check Schedule Availability
        const endTime = new Date(appointmentDateTime.getTime() + service.duration * 60000);

        const conflicts = await prisma.appointment.findMany({
            where: {
                professionalId,
                status: { not: 'CANCELLED' },
                date: {
                    lt: endTime,
                    gte: appointmentDateTime
                }
            },
            include: { service: true }
        });

        const hasConflict = conflicts.some(conflict => {
            const conflictStart = new Date(conflict.date);
            const conflictEnd = new Date(conflictStart.getTime() + conflict.service.duration * 60000);
            return (appointmentDateTime < conflictEnd && endTime > conflictStart);
        });

        if (hasConflict) {
            return res.status(400).json({ message: 'Time slot not available' });
        }

        // 4. Create Appointment
        const appointment = await prisma.appointment.create({
            data: {
                date: appointmentDateTime,
                clientId,
                professionalId,
                serviceId,
                barbershopId: service.barbershopId
            },
            include: {
                client: true,
                service: true,
                professional: true
            }
        });

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
                    clientName: appointment.client?.name,
                    clientPhone: appointment.client?.phone,
                    serviceName: appointment.service?.name,
                    servicePrice: appointment.service?.price,
                    proName: appointment.professional?.name
                }
            }).catch(e => console.error('Webhook Error:', e.message));
        }

        res.status(201).json({ appointment, isGuest: !req.user });
    } catch (error) {
        console.error(error);
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
