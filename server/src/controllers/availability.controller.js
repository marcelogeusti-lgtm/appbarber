const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addMinutes, format, isBefore, isAfter, isEqual, parse } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

const TIMEZONE = 'America/Sao_Paulo';

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

        // 1. Target Date Configuration (Sao Paulo)
        // Parse the input string YYYY-MM-DD as being in Sao Paulo
        // This ensures "2023-01-01" means the full day in SP, not partial day if UTC.
        // We construct a string "YYYY-MM-DDT00:00:00" and parse it as that zone.
        const startOfDaySP = zonedTimeToUtc(`${date}T00:00:00`, TIMEZONE);
        const endOfDaySP = zonedTimeToUtc(`${date}T23:59:59`, TIMEZONE);

        // Deriving the day of week from the SP perspective
        // using utcToZonedTime to get the date object representing local time
        const dateSP = utcToZonedTime(startOfDaySP, TIMEZONE);
        const dayOfWeek = dateSP.getDay(); // 0-6 correct for SP

        // 2. Get Professionals
        const pros = await prisma.user.findMany({
            where: {
                workedBarbershopId: barbershopId,
                active: true,
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

        console.log(`[Availability] Calculating for Shop ${barbershopId} on ${date}. Active Pros: ${pros.length}`);

        if (pros.length === 0) {
            console.warn(`[Availability] No active professionals found for Shop ${barbershopId}`);
            return res.json([]); // Return empty list, don't just hang or error
        }

        // 3. Get Appointments (Stored in UTC, query by range)
        const appointments = await prisma.appointment.findMany({
            where: {
                barbershopId,
                date: {
                    gte: startOfDaySP,
                    lte: endOfDaySP
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

        const availability = [];

        for (const pro of pros) {
            const proSchedule = pro.professionalProfile?.schedules[0];

            if (!proSchedule) {
                availability.push({ proId: pro.id, proName: pro.name, slots: [] });
                continue;
            }

            const slots = [];

            // Helper to create a specific time on that day in SP
            const createTimeSP = (timeStr) => {
                // timeStr is "09:00"
                return zonedTimeToUtc(`${date}T${timeStr}:00`, TIMEZONE);
            };

            const workStart = createTimeSP(proSchedule.startTime);
            const workEnd = createTimeSP(proSchedule.endTime);

            let breakStart = null;
            let breakEnd = null;
            if (proSchedule.breakStart && proSchedule.breakEnd) {
                breakStart = createTimeSP(proSchedule.breakStart);
                breakEnd = createTimeSP(proSchedule.breakEnd);
            }

            // Iterate slots (every 30 mins)
            let currentSlot = workStart; // This is a Date object (UTC equivalent of Start Time SP)
            const stepMinutes = 30;

            while (currentSlot < workEnd) {
                const potentialEnd = addMinutes(currentSlot, totalDuration);

                // 1. Must finish before work ends
                if (potentialEnd > workEnd) {
                    currentSlot = addMinutes(currentSlot, stepMinutes);
                    continue;
                }

                // 2. Must not overlap break
                let overlapsBreak = false;
                if (breakStart && breakEnd) {
                    // Standard Overlap: (StartA < EndB) && (EndA > StartB)
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

                    const appStart = new Date(app.date); // Already UTC

                    // Logic to sum durations if multiple services in order
                    let appDuration = app.service?.duration || 30;
                    if (app.order && app.order.items && app.order.items.length > 0) {
                        const serviceItems = app.order.items.filter(i => i.type === 'SERVICE' && i.service);
                        if (serviceItems.length > 0) {
                            appDuration = serviceItems.reduce((sum, item) => sum + (item.service.duration * item.quantity), 0);
                        }
                    }

                    const appEnd = addMinutes(appStart, appDuration);

                    // Allow strict touch? (EndA == StartB is OK)
                    // If currentSlot == appEnd, it's fine.
                    // Overlap: StartA < EndB && EndA > StartB
                    return (currentSlot < appEnd && potentialEnd > appStart);
                });

                if (!isOccupied) {
                    // Convert back to SP Time string for frontend display "09:00"
                    const zonedSlot = utcToZonedTime(currentSlot, TIMEZONE);

                    // --- SAME DAY BUFFER LOGICK ---
                    // If target date is today, only show slots >= now + 15 mins
                    const nowSP = utcToZonedTime(new Date(), TIMEZONE);
                    const isToday = format(zonedDate, 'yyyy-MM-dd') === format(nowSP, 'yyyy-MM-dd');

                    if (isToday) {
                        const bufferTime = addMinutes(nowSP, 15);
                        if (isBefore(zonedSlot, bufferTime)) {
                            currentSlot = addMinutes(currentSlot, stepMinutes);
                            continue;
                        }
                    }
                    // ------------------------------

                    const timeString = format(zonedSlot, 'HH:mm');
                    slots.push(timeString);
                }

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
