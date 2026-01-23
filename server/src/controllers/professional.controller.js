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
        const normalize = (str) => str ? str.trim() : null;
        const onlyNumbers = (str) => str ? str.replace(/\D/g, '') : null;

        const normalizedEmail = email ? email.trim().toLowerCase() : null;
        const normalizedPhone = onlyNumbers(phone);
        const normalizedCpf = onlyNumbers(cpf);

        const conflictFilters = [];
        if (normalizedEmail) conflictFilters.push({ email: { equals: normalizedEmail, mode: 'insensitive' } });
        if (normalizedPhone) conflictFilters.push({ phone: normalizedPhone });
        if (normalizedCpf) conflictFilters.push({ cpf: normalizedCpf });

        let existingUser = null;

        if (conflictFilters.length > 0) {
            existingUser = await prisma.user.findFirst({
                where: {
                    OR: conflictFilters
                },
                include: { professionalProfile: true }
            });
        }


        let targetUserId = null;

        if (existingUser) {
            const dbEmail = existingUser.email ? existingUser.email.toLowerCase() : '';
            const emailMatch = normalizedEmail && dbEmail === normalizedEmail;
            const phoneMatch = normalizedPhone && existingUser.phone === normalizedPhone;
            const cpfMatch = normalizedCpf && existingUser.cpf === normalizedCpf;

            // If it's a perfect match (or enough to identify as the same person)
            if (emailMatch || (phoneMatch && !existingUser.email) || (cpfMatch && !existingUser.email)) {
                targetUserId = existingUser.id;

                // Check if they are already an active Pro in THIS barbershop
                const isAlreadyProHere = existingUser.professionalProfile &&
                    !existingUser.professionalProfile.deletedAt &&
                    existingUser.workedBarbershopId === barbershopId &&
                    existingUser.deletedAt === null;

                if (isAlreadyProHere) {
                    return res.status(400).json({ message: 'Este usuário já está cadastrado como profissional ativo nesta barbearia.' });
                }

                // If they were removed (soft-deleted) or are just a client, we will proceed to re-activate/link them below.
            } else {
                // Conflict: Data belongs to another identity
                if (phoneMatch) return res.status(400).json({ message: 'Este telefone está vinculado a outro e-mail. Use o e-mail original para re-ativar este profissional.' });
                if (cpfMatch) return res.status(400).json({ message: 'Este CPF está vinculado a outro e-mail.' });
                if (emailMatch) return res.status(400).json({ message: 'Este e-mail está em uso por outra conta.' });

                return res.status(400).json({ message: 'Dados conflitantes (E-mail, Telefone ou CPF) com outra conta ativa.' });
            }
        }

        // Re-check Limit if we are creating a NEW pro (targetUserId is null OR targetUserId exists but wasn't a PRO before)
        const isNewPro = !targetUserId || (existingUser && (!existingUser.professionalProfile || existingUser.professionalProfile.deletedAt));

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
                name, nickname,
                phone: normalizedPhone,
                landline: onlyNumbers(landline),
                cpf: normalizedCpf,
                cnpj: onlyNumbers(cnpj),
                rg: onlyNumbers(rg),
                gender,
                birthday: birthday ? new Date(birthday) : null,
                notes, avatarUrl,
                active: active !== undefined ? active : true,
                workedBarbershopId: barbershopId,
                deletedAt: null // Explicitly clear deletedAt for re-activation
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
                        email: normalizedEmail,
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
            const target = error.meta?.target || 'campo único';
            return res.status(400).json({ message: `Erro de duplicidade: O valor informado para '${target}' já existe no banco de dados (pode ser um usuário removido).` });
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

        // Perform Hard Delete (Permanently remove)
        // Warning: This action is irreversible.

        await prisma.$transaction(async (tx) => {
            // 1. Remove Dependencies
            if (pro.professionalProfile) {
                const proId = pro.professionalProfile.id;
                // Delete Schedules
                await tx.schedule.deleteMany({ where: { professionalId: proId } });
                // Delete Commissions overrides
                await tx.professionalServiceCommission.deleteMany({ where: { professionalId: pro.id } });

                // Delete Professional Profile
                await tx.professional.delete({ where: { id: proId } });
            }

            // 2. Determine if we delete the User account or just downgrade
            // If the user is the OWNER of a barbershop, we generally DO NOT delete the account, just the pro profile.
            // If the user is just a STAFF (BARBER), we DELETE the account entirely to free up email/phone.

            const isOwner = await tx.barbershop.findFirst({ where: { ownerId: id } });

            if (isOwner) {
                // Owner: Just remove professional status
                await tx.user.update({
                    where: { id },
                    data: {
                        // role: 'CLIENT', // Optionally downgrade to CLIENT or keep ADMIN? 
                        // Usually owners are ADMIN. If we delete pro profile, they are just Admin manager.
                        // User asked "limpo no banco". If we keep User, email/phone is still taken.
                        // But if we delete Owner User, the Barbershop becomes orphan (fatal error).
                        // So for Owner, we MUST keep User.
                        // This handles the "Auto-Create" scenario where Owner is also Pro.
                        // If they delete themselves as pro, they just stop appearing in schedule.
                    }
                });
                // Note: We already deleted professionalProfile above.
            } else {
                // Staff: DELETE EVERYTHING (User + AuthUser)
                // This frees up the Email/Phone/CPF.

                if (pro.authUserId) {
                    await tx.authUser.delete({ where: { id: pro.authUserId } });
                    // User deletes via Cascade? If not, delete explicitly.
                    // Assuming no cascade configured on AuthUser->User in schema shown (relation exists but onDelete unsure).
                    // Safe to try delete user if it still exists.
                    try {
                        await tx.user.delete({ where: { id } });
                    } catch (e) {
                        // Ignore if cascade already handled it
                    }
                } else {
                    await tx.user.delete({ where: { id } });
                }
            }
        });

        res.json({ message: 'Profissional e dados vinculados removidos permanentemente.' });
    } catch (error) {
        console.error('Delete Pro error:', error);
        res.status(500).json({ message: 'Erro ao remover profissional' });
    }
};
