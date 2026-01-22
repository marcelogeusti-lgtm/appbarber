const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Get Professional Profile (with Schedule and Services)
exports.getProfessional = async (req, res) => {
    try {
        const { userId } = req.params;
        const pro = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                professionalProfile: {
                    include: {
                        schedules: true,
                        services: true
                    }
                }
            }
        });

        if (!pro) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        res.json(pro);
    } catch (error) {
        console.error('Get Professional error:', error);
        res.status(500).json({ message: 'Erro ao buscar profissional' });
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
        const saasPlans = require('../config/saasPlans');
        const {
            name, nickname, email, password, phone, landline, cpf, cnpj, rg,
            gender, birthday, notes, avatarUrl, position, bio,
            showInApp, showPublicly, appointmentInterval,
            zipCode, street, number, complement, neighborhood, city, state, country,
            services, schedules, role, active, barbershopId, commissionPercent
        } = req.body;

        if (!barbershopId) {
            return res.status(400).json({ message: 'ID da Barbearia é obrigatório' });
        }

        // --- SAAS LIMIT CHECK START ---
        const barbershop = await prisma.barbershop.findUnique({
            where: { id: barbershopId },
            select: { saasPlan: true }
        });

        if (!barbershop) return res.status(404).json({ message: 'Barbearia não encontrada' });

        const userPlan = barbershop.saasPlan || 'BASIC';
        const planConfig = saasPlans[userPlan] || saasPlans.BASIC;

        const activeBarbersCount = await prisma.user.count({
            where: {
                workedBarbershopId: barbershopId,
                role: 'BARBER',
                deletedAt: null
            }
        });

        const isSuperAdmin = req.user && req.user.role === 'SUPER_ADMIN';

        // Relaxed check: Only enforce limit if creating a NEW active barber
        // We defer specific checks, but general count applies.
        if (!isSuperAdmin && activeBarbersCount >= planConfig.maxBarbers) {
            // We verify if we are just updating an existing user who is ALREADY counted or adding a new one
            // Ideally we check after we know if it's a new PRO.
            // For safety, we keep the block but maybe we should allow it if the user being added is the OWNER (already exists).
            // Let's proceed and check later or assume limit enforcement is strict.
            // return res.status(403).json({
            //    message: `Limite de barbeiros atingido para o plano ${planConfig.name} (${activeBarbersCount}/${planConfig.maxBarbers}). Faça upgrade.`
            // });
        }
        // --- SAAS LIMIT CHECK END ---

        // 1. Check for conflicts or existing user
        const conflictFilters = [];
        if (email) conflictFilters.push({ email });
        if (phone) conflictFilters.push({ phone });
        if (cpf) conflictFilters.push({ cpf });

        let existingUser = null;

        if (conflictFilters.length > 0) {
            existingUser = await prisma.user.findFirst({
                where: {
                    OR: conflictFilters,
                    deletedAt: null
                },
                include: { professionalProfile: true }
            });
        }

        let targetUserId = null;

        if (existingUser) {
            // Analyze conflict
            const emailMatch = email && existingUser.email === email;
            const phoneMatch = phone && existingUser.phone === phone;
            const cpfMatch = cpf && existingUser.cpf === cpf;

            // Scenario 1: Exact Match (Email matches) -> It is the same person.
            // Scenario 2: Phone matches, but Email differs -> Danger (Conflict).
            // Exception: If existingUser has NO email, we might claim it? (Dangerous).

            // Rule: If Email is provided and matches, we assume it's the intended user.
            if (emailMatch) {
                targetUserId = existingUser.id;

                // If they are already a pro in THIS shop, warn?
                // But maybe they are Pro in Shop A and want to be Pro in Shop B (if supported).
                // Our schema has 'workedBarbershopId' single field. So multicompany staff is not fully supported yet in User model.
                // Assuming single shop context.

                if (existingUser.professionalProfile && existingUser.workedBarbershopId === barbershopId) {
                    return res.status(400).json({ message: 'Este usuário já está cadastrado como profissional nesta barbearia.' });
                }

                // If they are Owner (different ID?) or just a User, we proceed to upgrade/update them.
            } else {
                // Email didn't match (or wasn't provided), but Phone or CPF did.
                // This implies another user owns this Phone/CPF.
                if (phoneMatch) return res.status(400).json({ message: 'Telefone já cadastrado em outra conta.' });
                if (cpfMatch) return res.status(400).json({ message: 'CPF já cadastrado em outra conta.' });

                // Fallback
                return res.status(400).json({ message: 'Dados conflitantes (E-mail, Telefone ou CPF) com outro usuário existente.' });
            }
        }

        // Re-check Limit if we are creating a NEW pro (targetUserId is null OR targetUserId exists but wasn't a PRO before)
        const isNewPro = !targetUserId || (existingUser && !existingUser.professionalProfile);

        if (isNewPro && !isSuperAdmin && activeBarbersCount >= planConfig.maxBarbers) {
            return res.status(403).json({
                message: `Limite de barbeiros atingido para o plano ${planConfig.name} (${activeBarbersCount}/${planConfig.maxBarbers}). Faça upgrade.`
            });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);

        const result = await prisma.$transaction(async (tx) => {
            let user;

            // Prepare common data
            const userData = {
                name, nickname, phone, landline, cpf, cnpj, rg, gender,
                birthday: birthday ? new Date(birthday) : null,
                notes, avatarUrl,
                active: active !== undefined ? active : true,
                workedBarbershopId: barbershopId, // Link to shop
                // Only update role if it's currently CLIENT or if we want to enforce BARBER.
                // If user is ADMIN, keep ADMIN (as they are owner).
                // But getting "Pro" access usually implies having professionalProfile.
                // We default to BARBER if they are just a Client.
            };

            if (role) userData.role = role; // If role explicitly sent, use it (careful with downgrading Admins)

            if (targetUserId) {
                // UPDATE existing user
                // Be careful not to overwrite password unless provided
                if (password) userData.password = hashedPassword;

                // Don't downgrade ADMINs to BARBER unless explicit?
                // logic: If existing is ADMIN and request says BARBER, do we change it?
                // Usually owners creating themselves will send Role=ADMIN or Role=BARBER.
                // Safest: If existing is ADMIN, ignore 'BARBER' role request to prevent lockout.
                if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_ADMIN') {
                    delete userData.role;
                }

                user = await tx.user.update({
                    where: { id: targetUserId },
                    data: userData
                });
            } else {
                // CREATE new user
                user = await tx.user.create({
                    data: {
                        ...userData,
                        email,
                        password: hashedPassword,
                        role: role || 'BARBER'
                    }
                });
            }

            // Create or Update Professional Profile
            const profile = await tx.professional.upsert({
                where: { userId: user.id },
                update: {
                    position, bio, showInApp, showPublicly,
                    appointmentInterval: appointmentInterval ? parseInt(appointmentInterval) : 30,
                    zipCode, street, number, complement, neighborhood, city, state, country,
                    deletedAt: null,
                    services: services ? { set: services.map(id => ({ id })) } : undefined,
                    commissionPercent: commissionPercent ? parseFloat(commissionPercent) : undefined
                },
                create: {
                    userId: user.id,
                    position, bio, showInApp, showPublicly,
                    appointmentInterval: appointmentInterval ? parseInt(appointmentInterval) : 30,
                    zipCode, street, number, complement, neighborhood, city, state, country,
                    services: services ? { connect: services.map(id => ({ id })) } : undefined,
                    commissionPercent: commissionPercent ? parseFloat(commissionPercent) : 0
                }
            });

            // Update schedules
            if (schedules && schedules.length > 0) {
                await tx.schedule.deleteMany({ where: { professionalId: profile.id } });
                await tx.schedule.createMany({
                    data: schedules.map(s => ({
                        dayOfWeek: parseInt(s.dayOfWeek),
                        startTime: s.startTime,
                        endTime: s.endTime,
                        breakStart: s.breakStart,
                        breakEnd: s.breakEnd,
                        isOff: !!s.isOff,
                        professionalId: profile.id
                    }))
                });
            }

            return user;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Create Prof error:', error);
        // Better error parsing for unique constraints if they still happen
        if (error.code === 'P2002') {
            return res.status(400).json({ message: `Dados já cadastrados no sistema: ${error.meta?.target}` });
        }
        res.status(500).json({ message: 'Erro ao criar profissional: ' + error.message });
    }
};

exports.listProfessionals = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const pros = await prisma.user.findMany({
            where: {
                workedBarbershopId: barbershopId,
                role: { in: ['BARBER', 'ADMIN'] },
                deletedAt: null,
                professionalProfile: {
                    deletedAt: null
                }
            },
            include: {
                professionalProfile: {
                    include: {
                        schedules: true,
                        services: true
                    }
                }
            }
        });

        res.json(pros);
    } catch (error) {
        console.error('List Profs error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, nickname, email, phone, landline, cpf, cnpj, rg,
            gender, birthday, notes, avatarUrl, position, bio,
            showInApp, showPublicly, appointmentInterval,
            zipCode, street, number, complement, neighborhood, city, state, country,
            services, schedules, role, active, commissionPercent
        } = req.body;

        const updated = await prisma.$transaction(async (tx) => {
            // Update User
            const user = await tx.user.update({
                where: { id },
                data: {
                    name, nickname, email, phone, landline, cpf, cnpj, rg, gender,
                    birthday: birthday ? new Date(birthday) : undefined,
                    notes, avatarUrl, active, role
                }
            });

            // Update Professional Profile
            const profile = await tx.professional.upsert({
                where: { userId: id },
                update: {
                    position, bio, showInApp, showPublicly,
                    appointmentInterval: appointmentInterval ? parseInt(appointmentInterval) : undefined,
                    zipCode, street, number, complement, neighborhood, city, state, country,
                    services: services ? { set: services.map(id => ({ id })) } : undefined,
                    commissionPercent: commissionPercent ? parseFloat(commissionPercent) : undefined
                },
                create: {
                    userId: id,
                    position, bio, showInApp, showPublicly,
                    appointmentInterval: appointmentInterval ? parseInt(appointmentInterval) : 30,
                    zipCode, street, number, complement, neighborhood, city, state, country,
                    services: services ? { connect: services.map(id => ({ id })) } : undefined
                }
            });

            // Update schedules if provided
            if (schedules) {
                await tx.schedule.deleteMany({ where: { professionalId: profile.id } });
                if (schedules.length > 0) {
                    await tx.schedule.createMany({
                        data: schedules.map(s => ({
                            dayOfWeek: parseInt(s.dayOfWeek),
                            startTime: s.startTime,
                            endTime: s.endTime,
                            breakStart: s.breakStart,
                            breakEnd: s.breakEnd,
                            isOff: !!s.isOff,
                            professionalId: profile.id
                        }))
                    });
                }
            }

            return user;
        });

        res.json(updated);
    } catch (error) {
        console.error('Update Pro error:', error);
        res.status(500).json({ message: 'Erro ao atualizar profissional' });
    }
};

exports.deleteProfessional = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if professional exists
        const pro = await prisma.user.findUnique({
            where: { id },
            include: { professionalProfile: true }
        });

        if (!pro || (pro.role !== 'BARBER' && pro.role !== 'ADMIN')) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        // Perform Soft Delete:
        // 1. Remove Professional Profile (so they don't show up as barber)
        // 2. Change Role to CLIENT (removes access)
        // 3. Set active = false (optional, but good for keeping history without access)

        await prisma.$transaction(async (tx) => {
            // Soft Delete Professional Profile
            if (pro.professionalProfile) {
                await tx.professional.update({
                    where: { id: pro.professionalProfile.id },
                    data: { deletedAt: new Date() }
                });
                // Note: We keep schedules but they won't be accessible because the profile is marked deleted
            }

            // Downgrade User and remove linkage
            await tx.user.update({
                where: { id },
                data: {
                    role: 'CLIENT',
                    workedBarbershopId: null,
                }
            });
        });

        res.json({ message: 'Profissional removido com sucesso' });
    } catch (error) {
        console.error('Delete Pro error:', error);
        res.status(500).json({ message: 'Erro ao remover profissional' });
    }
};
