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
        console.log('Creating Professional Body:', req.body);
        const saasPlans = require('../config/saasPlans');
        const { name, email, password, phone, position, barbershopId } = req.body;

        if (!barbershopId) {
            return res.status(400).json({ message: 'ID da Barbearia é obrigatório' });
        }

        // --- SAAS LIMIT CHECK START ---
        // 1. Get Barbershop Plan
        const barbershop = await prisma.barbershop.findUnique({
            where: { id: barbershopId },
            select: { saasPlan: true }
        });

        if (!barbershop) return res.status(404).json({ message: 'Barbearia não encontrada' });

        const userPlan = barbershop.saasPlan || 'BASIC';
        const planConfig = saasPlans[userPlan] || saasPlans.BASIC;

        if (!planConfig) {
            console.error(`Plan config not found for plan: ${userPlan}`);
            // Fallback to basic if plan not found in config, or handle error
        }

        // 2. Count Active Barbers
        // We count users with role BARBER associated with this shop
        const activeBarbersCount = await prisma.user.count({
            where: {
                workedBarbershopId: barbershopId,
                role: 'BARBER',
            }
        });

        const isSuperAdmin = req.user && req.user.role === 'SUPER_ADMIN';

        if (!isSuperAdmin && activeBarbersCount >= planConfig.maxBarbers) {
            return res.status(403).json({
                message: `Limite de barbeiros atingido para o plano ${planConfig.name} (${activeBarbersCount}/${planConfig.maxBarbers}). Faça upgrade para adicionar mais.`
            });
        }
        // --- SAAS LIMIT CHECK END ---

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
        res.status(500).json({ message: 'Erro ao criar profissional: ' + error.message });
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
