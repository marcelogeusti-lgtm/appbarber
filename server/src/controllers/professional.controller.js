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
            select: { saasPlan: true, subscriptionStatus: true }
        });

        if (!barbershop) return res.status(404).json({ message: 'Barbearia não encontrada' });

        const isTrial = barbershop.subscriptionStatus === 'TRIAL';
        const userPlan = barbershop.saasPlan || 'BASIC';
        const planConfig = saasPlans[userPlan] || saasPlans.BASIC;

        const activeBarbersCount = await prisma.user.count({
            where: {
                workedBarbershopId: barbershopId,
                role: 'BARBER'
            }
        });

        const isSuperAdmin = req.user && req.user.role === 'SUPER_ADMIN';

        if (!isSuperAdmin && !isTrial && activeBarbersCount >= planConfig.maxBarbers) {
            return res.status(403).json({
                message: `Limite de barbeiros atingido para o plano ${planConfig.name} (${activeBarbersCount}/${planConfig.maxBarbers}). Faça upgrade.`
            });
        }
        // --- SAAS LIMIT CHECK END ---

        const normalize = (str) => str ? str.trim() : null;
        const onlyNumbers = (str) => str ? str.replace(/\D/g, '') : null;

        const normalizedEmail = email ? email.trim().toLowerCase() : null;
        const normalizedPhone = onlyNumbers(phone);
        const normalizedCpf = onlyNumbers(cpf);

        // Check for conflicts manually to give better error messages before transaction
        if (normalizedEmail) {
            const existingEmail = await prisma.user.findFirst({ where: { email: { equals: normalizedEmail, mode: 'insensitive' } } });
            if (existingEmail) return res.status(400).json({ message: 'Este e-mail já está em uso por outro usuário.' });
        }
        if (normalizedPhone) {
            const existingPhone = await prisma.user.findFirst({ where: { phone: normalizedPhone } });
            if (existingPhone) return res.status(400).json({ message: 'Este telefone já está em uso por outro usuário.' });
        }
        if (normalizedCpf) {
            const existingCpf = await prisma.user.findFirst({ where: { cpf: normalizedCpf } });
            if (existingCpf) return res.status(400).json({ message: 'Este CPF já está em uso por outro usuário.' });
        }

        const hashedPassword = await bcrypt.hash(password || '123456', 10);

        const result = await prisma.$transaction(async (tx) => {
            // Prepare user data
            const userData = {
                name, nickname,
                email: normalizedEmail,
                password: hashedPassword,
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
                role: role || 'BARBER'
            };

            const user = await tx.user.create({ data: userData });

            // Prepare Commission
            let comPercent = 0;
            if (commissionPercent !== undefined && commissionPercent !== '' && commissionPercent !== null) {
                comPercent = parseFloat(commissionPercent);
                if (isNaN(comPercent)) comPercent = 0;
            }

            // Create Professional Profile
            const profile = await tx.professional.create({
                data: {
                    userId: user.id,
                    position, bio, showInApp, showPublicly,
                    appointmentInterval: appointmentInterval ? parseInt(appointmentInterval) : 30,
                    zipCode, street, number, complement, neighborhood, city, state, country,
                    commissionPercent: comPercent,
                    services: services ? { connect: services.map(id => ({ id })) } : undefined
                }
            });

            // Creates schedules
            if (schedules && schedules.length > 0) {
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
        if (error.code === 'P2002') {
            const target = error.meta?.target || 'campo único';
            return res.status(400).json({ message: `Erro: O valor informado para '${target}' já existe no sistema.` });
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
                role: { in: ['BARBER', 'ADMIN', 'SUPER_ADMIN', 'BARBER_CONSULTA'] },
                // removed active: true so admins can see inactive
            },
            include: {
                professionalProfile: {
                    include: {
                        schedules: true,
                        services: true
                    }
                }
            },
            orderBy: { name: 'asc' }
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

        const normalize = (str) => str ? str.trim() : null;
        const onlyNumbers = (str) => str ? str.replace(/\D/g, '') : null;

        const updated = await prisma.$transaction(async (tx) => {

            // Prepare Update Data
            const updateData = {
                name, nickname,
                landline: onlyNumbers(landline),
                cpf: onlyNumbers(cpf),
                cnpj: onlyNumbers(cnpj),
                rg: onlyNumbers(rg),
                gender,
                birthday: birthday ? new Date(birthday) : undefined,
                notes, avatarUrl, active, role
            };

            if (email !== undefined) updateData.email = email ? email.trim().toLowerCase() : null;
            if (phone !== undefined) updateData.phone = onlyNumbers(phone);

            // Update User
            const user = await tx.user.update({
                where: { id },
                data: updateData
            });

            if (active !== undefined) {
                console.log(`[Professional] Status changed for ${id}: ${active ? 'ACTIVATED' : 'DEACTIVATED'} by ${req.user.id}`);
            }

            // Commission Handling
            let comPercent = undefined;
            if (commissionPercent !== undefined && commissionPercent !== null && commissionPercent !== '') {
                comPercent = parseFloat(commissionPercent);
                if (isNaN(comPercent)) comPercent = 0;
            } else if (commissionPercent === 0 || commissionPercent === '0') {
                comPercent = 0;
            }

            // Update Professional Profile
            const profile = await tx.professional.upsert({
                where: { userId: id },
                update: {
                    position, bio, showInApp, showPublicly,
                    appointmentInterval: appointmentInterval ? parseInt(appointmentInterval) : undefined,
                    zipCode, street, number, complement, neighborhood, city, state, country,
                    commissionPercent: comPercent, // undefined means "do not update" in Prisma update
                    services: services ? { set: services.map(id => ({ id })) } : undefined
                },
                create: {
                    userId: id,
                    position, bio, showInApp, showPublicly,
                    appointmentInterval: appointmentInterval ? parseInt(appointmentInterval) : 30,
                    zipCode, street, number, complement, neighborhood, city, state, country,
                    commissionPercent: comPercent !== undefined ? comPercent : 0,
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

        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target && Array.isArray(target) && target.includes('email')) {
                return res.status(400).json({ message: 'Este e-mail já está sendo usado por outro usuário.' });
            }
            if (target && Array.isArray(target) && target.includes('phone')) {
                return res.status(400).json({ message: 'Este telefone já está sendo usado por outro usuário.' });
            }
            if (target && Array.isArray(target) && target.includes('cpf')) {
                return res.status(400).json({ message: 'Este CPF já está sendo usado por outro usuário.' });
            }
            // Fallback for string target or unknown
            return res.status(400).json({ message: 'Dados duplicados (e-mail, telefone ou CPF) já existem no sistema.' });
        }

        res.status(500).json({ message: 'Erro ao atualizar profissional: ' + error.message });
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

        const allowedRoles = ['BARBER', 'ADMIN', 'SUPER_ADMIN', 'BARBER_CONSULTA'];
        if (!pro || !allowedRoles.includes(pro.role)) {
            return res.status(404).json({ message: 'Profissional não encontrado' });
        }

        // Perform Hard Delete (Permanently remove ALL data)
        await prisma.$transaction(async (tx) => {
            // 1. Delete Schedules
            if (pro.professionalProfile) {
                await tx.schedule.deleteMany({ where: { professionalId: pro.professionalProfile.id } });
            }

            // 2. Delete Commissions Overrides
            await tx.professionalServiceCommission.deleteMany({ where: { professionalId: id } });

            // 3. Delete waitlist entries
            await tx.waitlist.deleteMany({ where: { professionalId: id } });

            // 4. Handle Appointments and Commissions
            // We MUST delete these to free up the professional.
            // Check for NoShowRecords linked to appointments of this professional
            const proAppointments = await tx.appointment.findMany({
                where: { professionalId: id },
                select: { id: true }
            });
            const appIds = proAppointments.map(a => a.id);

            if (appIds.length > 0) {
                // Delete NoShowRecords
                await tx.noShowRecord.deleteMany({ where: { appointmentId: { in: appIds } } });
                // Delete PackageUsage
                await tx.packageUsage.deleteMany({ where: { appointmentId: { in: appIds } } });
                // Delete Notifications linked to these appointments
                await tx.notification.deleteMany({ where: { appointmentId: { in: appIds } } });
            }

            // Delete Commissions
            await tx.commission.deleteMany({ where: { barberId: id } });

            // Delete Appointments
            await tx.appointment.deleteMany({ where: { professionalId: id } });

            // 5. Delete Orders (and their items if not cascaded)
            // Assuming we want a complete wipe.
            const proOrders = await tx.order.findMany({
                where: { professionalId: id },
                select: { id: true }
            });
            const orderIds = proOrders.map(o => o.id);
            if (orderIds.length > 0) {
                await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
                await tx.order.deleteMany({ where: { id: { in: orderIds } } });
            }

            // 6. Delete Professional Profile
            if (pro.professionalProfile) {
                await tx.professional.delete({ where: { userId: id } });
            }

            // 7. Delete User and AuthUser
            // If the user is an owner of a barbershop, we keep the User account but remove Pro status.
            // Otherwise, we delete everything.
            const isOwner = await tx.barbershop.findFirst({ where: { ownerId: id } });

            if (isOwner) {
                // Keep the owner but they are no longer a professional
                // Role stays ADMIN (usually)
            } else {
                // Staff: Full wipe
                if (pro.authUserId) {
                    await tx.authUser.delete({ where: { id: pro.authUserId } });
                } else {
                    await tx.user.delete({ where: { id } });
                }
            }
        });

        console.log(`[Professional] Hard DELETE performed on ${id} by ${req.user.id}. All linked data removed.`);
        res.json({ message: 'Profissional e todos os dados vinculados removidos permanentemente.' });
    } catch (error) {
        console.error('Delete Pro error:', error);
        res.status(500).json({ message: 'Erro ao remover profissional permanentemente: ' + error.message });
    }
};
