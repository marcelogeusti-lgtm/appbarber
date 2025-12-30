const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addMinutes, format, parseISO, startOfDay, endOfDay } = require('date-fns');

exports.getAvailableSlots = async (req, res) => {
    try {
        const { barbershopId, date } = req.params; // date: YYYY-MM-DD
        const targetDate = new Date(date);
        const dayOfWeek = targetDate.getDay();

        // 1. Get Professionals for this barbershop
        const pros = await prisma.user.findMany({
            where: {
                OR: [
                    { ownedBarbershops: { some: { id: barbershopId } } },
                    { workedBarbershopId: barbershopId }
                ],
                professionalProfile: { isNot: null }
            },
            include: {
                professionalProfile: {
                    include: {
                        schedules: {
                            where: { dayOfWeek, isOff: false }
                        }
                    }
                }
            }
        });

        // 2. Get all non-cancelled appointments for this date
        const appointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                date: {
                    gte: startOfDay(targetDate),
                    lte: endOfDay(targetDate)
                },
                status: { not: 'CANCELLED' }
            },
            include: { service: true }
        });

        const availability = [];

        for (const pro of pros) {
            const proSchedule = pro.professionalProfile?.schedules[0];
            if (!proSchedule) continue;

            const slots = [];
            let current = new Date(`${date}T${proSchedule.startTime}:00Z`);
            const end = new Date(`${date}T${proSchedule.endTime}:00Z`);

            while (current < end) {
                const slotTime = format(current, 'HH:mm');
                const slotEnd = addMinutes(current, 30); // 30 min slots

                // Check conflict
                const isOccupied = appointments.some(app => {
                    if (app.professionalId !== pro.id) return false;
                    const appStart = new Date(app.date);
                    const appEnd = addMinutes(appStart, app.service.duration);
                    return (current < appEnd && slotEnd > appStart);
                });

                if (!isOccupied) {
                    slots.push(slotTime);
                }
                current = slotEnd;
            }

            availability.push({
                proId: pro.id,
                proName: pro.name,
                slots
            });
        }

        res.json(availability);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error calculating availability' });
    }
};
