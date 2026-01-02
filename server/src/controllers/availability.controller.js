const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addMinutes, format, parseISO, startOfDay, endOfDay } = require('date-fns');

exports.getAvailableSlots = async (req, res) => {
    try {
        const { barbershopId, date } = req.params;
        const { serviceIds } = req.query; // Expect comma separated IDs

        // 0. Validate Input
        if (!serviceIds) {
            return res.status(400).json({ message: 'Service IDs are required to calculate availability.' });
        }

        const servicesList = await prisma.service.findMany({
            where: { id: { in: serviceIds.split(',') } }
        });

        const totalDuration = servicesList.reduce((acc, curr) => acc + curr.duration, 0);

        if (totalDuration === 0) {
            return res.status(400).json({ message: 'Invalid services or zero duration.' });
        }

        // Target Date
        // Fix timezone issues by treating the date string explicitly
        // We assume 'date' is YYYY-MM-DD. We want to work with this local date.
        // For simplicity in comparison, we'll build Date objects carefully.
        const [year, month, day] = date.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day);
        const dayOfWeek = targetDate.getDay();

        // 1. Get Professionals
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

        // 2. Get Appointments
        // We fetch all appointments for the day to check collisions
        const startOfDayDate = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDayDate = new Date(year, month - 1, day, 23, 59, 59);

        const appointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                date: {
                    gte: startOfDayDate,
                    lte: endOfDayDate
                },
                status: { not: 'CANCELLED' }
            },
            include: { service: true }
        });

        const availability = [];

        for (const pro of pros) {
            const proSchedule = pro.professionalProfile?.schedules[0];

            // If pro receives appointments but has no schedule, or is off, skip
            if (!proSchedule) {
                availability.push({ proId: pro.id, proName: pro.name, slots: [] });
                continue;
            }

            const slots = [];

            // Parse Schedule Times (HH:mm) to Date objects for this day
            const [startH, startM] = proSchedule.startTime.split(':').map(Number);
            const [endH, endM] = proSchedule.endTime.split(':').map(Number);

            let workStart = new Date(year, month - 1, day, startH, startM, 0);
            let workEnd = new Date(year, month - 1, day, endH, endM, 0);

            // Parse Break Times if they exist
            let breakStart = null;
            let breakEnd = null;
            if (proSchedule.breakStart && proSchedule.breakEnd) {
                const [bsH, bsM] = proSchedule.breakStart.split(':').map(Number);
                const [beH, beM] = proSchedule.breakEnd.split(':').map(Number);
                breakStart = new Date(year, month - 1, day, bsH, bsM, 0);
                breakEnd = new Date(year, month - 1, day, beH, beM, 0);
            }

            // Iterate slots (e.g. every 30 mins)
            // You can make the step configurable or equal to 'totalDuration' or fixed 30.
            // Ideally, fixed 30 mins (09:00, 09:30) is standard.
            let currentSlot = new Date(workStart);
            const stepMinutes = 30;

            while (currentSlot < workEnd) {
                // Determine potential appointment block
                const potentialEnd = addMinutes(currentSlot, totalDuration);

                // 1. Must finish before work ends
                if (potentialEnd > workEnd) {
                    currentSlot = addMinutes(currentSlot, stepMinutes);
                    continue;
                }

                // 2. Must not overlap break
                let overlapsBreak = false;
                if (breakStart && breakEnd) {
                    // Overlap logic: (StartA < EndB) and (EndA > StartB)
                    if (currentSlot < breakEnd && potentialEnd > breakStart) {
                        overlapsBreak = true;
                    }
                }

                if (overlapsBreak) {
                    currentSlot = addMinutes(currentSlot, stepMinutes);
                    continue;
                }

                // 3. Must not overlap existing appointments
                const isOccupied = appointments.some(app => {
                    if (app.professionalId !== pro.id) return false;

                    const appStart = new Date(app.date);
                    // Calculates appEnd based on its stored service duration
                    // Note: If you stored duration in appointment, use it. 
                    // If not, use app.service.duration.
                    // Assuming app.service is available.
                    const appDuration = app.service?.duration || 30;
                    const appEnd = addMinutes(appStart, appDuration);

                    // Check Overlap
                    return (currentSlot < appEnd && potentialEnd > appStart);
                });

                if (!isOccupied) {
                    // Format output HH:mm
                    const timeString = format(currentSlot, 'HH:mm');
                    slots.push(timeString);
                }

                // Move to next slot
                currentSlot = addMinutes(currentSlot, stepMinutes);
            }

            availability.push({
                proId: pro.id,
                proName: pro.name,
                slots
            });
        }

        res.json(availability);

    } catch (error) {
        console.error('Availability calculation error:', error);
        res.status(500).json({ message: 'Error calculating availability' });
    }
};
