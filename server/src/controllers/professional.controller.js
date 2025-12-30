const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Get Professional Profile (with Schedule)
exports.getProfessional = async (req, res) => {
    try {
        const { userId } = req.params;
        const pro = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                professionalProfile: {
                    include: { schedules: true }
                }
            }
        });

        if (!pro || pro.role !== 'BARBER') {
            // Note: Admin might also provide services? For now assuming simple Role check
            // Or if professionalProfile exists
        }

        res.json(pro);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Schedule
exports.updateSchedule = async (req, res) => {
    try {
        const { schedules, userId } = req.body; // Array of { dayOfWeek, startTime, endTime, isOff }
        // User must be the professional or admin
        const targetUserId = userId || req.user.id;

        // Find professional profile ID
        const user = await prisma.user.findUnique({
            where: { id: targetUserId },
            include: { professionalProfile: true }
        });

        if (!user.professionalProfile) {
            // Create profile if missing (first time)
            user.professionalProfile = await prisma.professional.create({
                data: { userId: user.id }
            });
        }

        const proId = user.professionalProfile.id;

        // Transaction to replace schedules
        await prisma.$transaction(async (tx) => {
            // Delete existing
            await tx.schedule.deleteMany({ where: { professionalId: proId } });

            // Create new
            if (schedules && schedules.length > 0) {
                await tx.schedule.createMany({
                    data: schedules.map(s => ({
                        dayOfWeek: parseInt(s.dayOfWeek),
                        startTime: s.startTime,
                        endTime: s.endTime,
                        isOff: !!s.isOff,
                        professionalId: proId
                    }))
                });
            }
        });

        res.json({ message: 'Schedule updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProfessional = async (req, res) => {
    try {
        const { name, email, password, phone, position, barbershopId } = req.body;

        // Check if user already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'E-mail já cadastrado' });

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User and Profile in Transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    phone,
                    role: 'BARBER',
                    workedBarbershopId: barbershopId
                }
            });

            await tx.professional.create({
                data: {
                    userId: newUser.id,
                    position: position || 'Barbeiro'
                }
            });

            return newUser;
        });

        res.status(201).json(user);
    } catch (error) {
        console.error('Create Prof error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.listProfessionals = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const pros = await prisma.user.findMany({
            where: { workedBarbershopId: barbershopId, role: 'BARBER' },
            include: { professionalProfile: { include: { schedules: true } } }
        });

        res.json(pros);
    } catch (error) {
        console.error('List Profs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
