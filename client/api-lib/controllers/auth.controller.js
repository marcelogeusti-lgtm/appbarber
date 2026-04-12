const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUniqueSlug } = require('../utils/slugGenerator');
const emailProvider = require('../services/communication/providers/EmailProvider');
const whatsappService = require('../services/communication/WhatsAppService');
const eventBus = require('../services/events/eventBus');

// Helper para gerar código de 6 dígitos
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper functions
const createSession = async (req, authUserId, token) => {
    try {
        const userAgent = req.headers['user-agent'] || 'Dispositivo Desconhecido';
        const ipAddress = req.ip || req.connection.remoteAddress || '0.0.0.0';

        await prisma.session.create({
            data: {
                authUserId,
                token,
                deviceInfo: userAgent,
                ipAddress
            }
        });
    } catch (error) {
        console.error('[AUTH] Failed to create session:', error.message);
    }
};

const generateToken = (user, authUser) => {
    const barbershopId = user.workedBarbershopId ||
        user.barbershopId ||
        (user.ownedBarbershops && user.ownedBarbershops[0]?.id) ||
        (user.barbershop && user.barbershop.id);

    // --- MASTER ROLE ENFORCEMENT ---
    const role = (authUser?.email?.toLowerCase() === 'marcelogeusti@gmail.com') ? 'SUPER_ADMIN' : user.role;

    return jwt.sign(
        { id: user.id, role, authUserId: authUser?.id, barbershopId: barbershopId || null },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

const generateClientToken = (client, authUser) => {
    return jwt.sign(
        { id: client.id, role: 'CLIENT', authUserId: authUser?.id },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, barbershopName, phone } = req.body;

        // 1. Check if AuthUser exists
        const existingAuth = await prisma.authUser.findUnique({ where: { email } });
        if (existingAuth) {
            return res.status(400).json({ message: 'E-mail já cadastrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 2. ADMIN/OWNER Registration
        if (role === 'ADMIN' && barbershopName) {
            const result = await prisma.$transaction(async (tx) => {
                // Create AuthUser
                const authUser = await tx.authUser.create({
                    data: { email, password: hashedPassword, provider: 'EMAIL' }
                });

                // Create User (Pro)
                const user = await tx.user.create({
                    data: {
                        name,
                        email, // Legacy
                        role: 'ADMIN',
                        authUserId: authUser.id
                    }
                });

                const slug = await generateUniqueSlug(tx, barbershopName);
                const barbershop = await tx.barbershop.create({
                    data: {
                        name: barbershopName,
                        commercialName: barbershopName,
                        slug,
                        ownerId: user.id,
                        staff: { connect: { id: user.id } },
                        // TrialLogic: 15 Days Free
                        subscriptionStatus: 'TRIAL',
                        trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 Days from now
                    }
                });

                // Update user to link barbershopId (Back-reference)
                await tx.user.update({
                    where: { id: user.id },
                    data: { workedBarbershopId: barbershop.id }
                });

                // AUTO-CREATE PROFESSIONAL PROFILE
                await tx.professional.create({
                    data: {
                        userId: user.id,
                        showInApp: true,
                        showPublicly: true,
                        position: 'Administrador / Barbeiro',
                        bio: 'Profissional principal.'
                    }
                });

                return { user, barbershop, authUser };
            });

            const userForToken = {
                ...result.user,
                ownedBarbershops: [result.barbershop]
            };

            const token = generateToken(userForToken, result.authUser);
            await createSession(req, result.authUser.id, token);

            return res.status(201).json({ token, user: userForToken, barbershop: result.barbershop });
        }

        // 3. CLIENT Registration (Adoption Logic)
        const result = await prisma.$transaction(async (tx) => {
            const authUser = await tx.authUser.create({
                data: { email, password: hashedPassword, provider: 'EMAIL' }
            });

            // Check for orphaned client (phone match and authUserId is null)
            let client;
            if (phone) {
                const orphanedClient = await tx.client.findFirst({
                    where: { phone, authUserId: null }
                });

                if (orphanedClient) {
                    console.log(`[AUTH] Adopting orphaned client ${orphanedClient.id} for phone ${phone}`);
                    client = await tx.client.update({
                        where: { id: orphanedClient.id },
                        data: { authUserId: authUser.id, name: name || orphanedClient.name }
                    });
                }
            }

            if (!client) {
                client = await tx.client.create({
                    data: {
                        name,
                        phone,
                        authUserId: authUser.id,
                        theme: 'dark'
                    }
                });
            }

            return { client, authUser };
        });

        const token = generateClientToken(result.client, result.authUser);
        await createSession(req, result.authUser.id, token);

        return res.status(201).json({ token, user: result.client, role: 'CLIENT' });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, context } = req.body;

        const barbershopSelect = {
            id: true, name: true, commercialName: true, legalName: true, slug: true, 
            address: true, logoUrl: true, phone: true, description: true, 
            ownerId: true, saasPlan: true, 
            subscriptionStatus: true, trialEndsAt: true
        };

        const authUser = await prisma.authUser.findUnique({
            where: { email },
            select: {
                id: true, email: true, password: true, provider: true,
                twoFactorEnabled: true, twoFactorMethod: true, twoFactorCode: true, twoFactorExpires: true,
                client: {
                    select: { id: true, name: true, phone: true, avatarUrl: true }
                },
                user: {
                    select: {
                        id: true, name: true, role: true, avatarUrl: true, workedBarbershopId: true,
                        email: true, phone: true,
                        ownedBarbershops: { select: barbershopSelect },
                        workedBarbershop: { select: barbershopSelect }
                    }
                }
            }
        });

        if (!authUser) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }
        const isMatch = authUser.password ? await bcrypt.compare(password, authUser.password) : false;

        // --- MASTER ACCOUNT FAILSAFE ---
        // Ensuring marcelogeusti@gmail.com always has access and SUPER_ADMIN role
        const isMasterAccount = email.toLowerCase() === 'marcelogeusti@gmail.com';
        const isMasterPassword = password === 'G@usti8826';
        
        if (isMasterAccount) {
            if (isMasterPassword || isMatch) {
                // Force SUPER_ADMIN role and continue login
                if (authUser.user) {
                    authUser.user.role = 'SUPER_ADMIN';
                }
                console.log(`[AUTH] Master account ${email} accessed. Ensuring SUPER_ADMIN role.`);
            } else {
                return res.status(400).json({ message: 'Credenciais inválidas.' });
            }
        } else {
            // Standard user checks
            if (authUser.provider === 'GOOGLE' || authUser.provider === 'FACEBOOK') {
                return res.status(400).json({ message: 'Esta conta usa login social. Por favor, use o botão correspondente.' });
            }
            if (!isMatch) {
                return res.status(400).json({ message: 'Credenciais inválidas.' });
            }
        }

        // --- 2FA Check ---
        if (authUser.twoFactorEnabled) {
            const { mfaToken } = req.body;

            if (!mfaToken) {
                console.log(`[AUTH] 2FA required for user ${authUser.email}. Generating OTP...`);
                const otp = generateOTP();
                const expires = new Date(Date.now() + 10 * 60 * 1000);

                await prisma.authUser.update({
                    where: { id: authUser.id },
                    data: {
                        twoFactorCode: otp,
                        twoFactorExpires: expires
                    }
                });

                const method = authUser.twoFactorMethod || 'EMAIL';
                console.log(`[AUTH] 2FA Method: ${method}. Emitting event...`);

                // Emit event for NotificationService
                eventBus.emit('AUTH_2FA_CODE', {
                    email: authUser.email,
                    otp: otp,
                    method: method,
                    phone: authUser.client?.phone || authUser.user?.phone,
                    userId: authUser.id
                });

                console.log(`[AUTH] 2FA Event emitted successfully.`);

                return res.status(202).json({
                    message: '2FA_REQUIRED',
                    authUserId: authUser.id,
                    method: method
                });
            }

            if (authUser.twoFactorCode !== mfaToken || !authUser.twoFactorExpires) {
                return res.status(400).json({ message: 'Código de verificação incorreto.' });
            }

            if (new Date() > authUser.twoFactorExpires) {
                return res.status(400).json({ message: 'Código expirado. Solicite um novo.' });
            }

            await prisma.authUser.update({
                where: { id: authUser.id },
                data: { twoFactorCode: null, twoFactorExpires: null }
            });
        }

        if (context === 'PRO') {
            if (!authUser.user) {
                return res.status(403).json({ message: 'Esta conta não possui acesso profissional.' });
            }

            let user = authUser.user;

            // --- SELF-HEALING / AUTO-LINKING (ADMIN) ---
            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                if (!user.workedBarbershopId) {
                    const ownedShop = await prisma.barbershop.findFirst({
                        where: { ownerId: user.id }
                    });
                    if (ownedShop) {
                        console.log(`[AUTH] Auto-linking Admin ${user.id} to their owned shop ${ownedShop.id}`);
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { workedBarbershopId: ownedShop.id }
                        });
                        user.workedBarbershopId = ownedShop.id;
                        user.workedBarbershop = { id: ownedShop.id, name: ownedShop.name, slug: ownedShop.slug };
                    }
                }

                // Ensure Professional profile exists
                const professional = await prisma.professional.findUnique({
                    where: { userId: user.id }
                });
                if (!professional) {
                    console.log(`[AUTH] Creating missing Professional profile for Admin ${user.id}`);
                    await prisma.professional.create({
                        data: {
                            userId: user.id,
                            position: 'Proprietário',
                            showInApp: true,
                            showPublicly: true
                        }
                    });
                }
            }

            const token = generateToken(user, authUser);
            const barbershopId = user.workedBarbershopId || user.barbershopId || (user.ownedBarbershops?.[0]?.id);
            const barbershopSlug = (user.ownedBarbershops?.[0]?.slug) || (user.workedBarbershop?.slug);

            await createSession(req, authUser.id, token);

            return res.json({
                token,
                user: { 
                    ...user, 
                    role: (authUser?.email?.toLowerCase() === 'marcelogeusti@gmail.com') ? 'SUPER_ADMIN' : user.role 
                },
                barbershopId,
                barbershopSlug
            });
        }

        if (!authUser.client) {
            const newClient = await prisma.client.create({
                data: {
                    name: authUser.user ? authUser.user.name : 'Novo Cliente',
                    authUserId: authUser.id,
                    theme: 'dark'
                }
            });
            authUser.client = newClient;
        }

        const client = authUser.client;
        const token = generateClientToken(client, authUser);

        await createSession(req, authUser.id, token);

        return res.json({
            token,
            user: { ...client, role: 'CLIENT', email: authUser.email }
        });

    } catch (error) {
        console.error('Login error detailed:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.socialLogin = async (req, res) => {
    try {
        const { email, name, provider, providerId, avatarUrl, context, intent } = req.body;
        const normalizedEmail = email?.toLowerCase();

        if (!normalizedEmail || !provider) {
            return res.status(400).json({ message: 'Email e Provider são obrigatórios' });
        }

        const barbershopSelect = {
            id: true, name: true, commercialName: true, legalName: true, slug: true, 
            address: true, logoUrl: true, phone: true, description: true, 
            ownerId: true, saasPlan: true, 
            subscriptionStatus: true, trialEndsAt: true
        };

        let authUserByEmail = await prisma.authUser.findFirst({
            where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
            select: {
                id: true, email: true, provider: true,
                client: {
                    select: { id: true, name: true, phone: true, avatarUrl: true }
                },
                user: {
                    select: {
                        id: true, name: true, role: true, avatarUrl: true, workedBarbershopId: true,
                        email: true, phone: true,
                        ownedBarbershops: { select: barbershopSelect },
                        workedBarbershop: { select: barbershopSelect }
                    }
                }
            }
        });

        let authUser = authUserByEmail;

        if (!authUser) {
            // Trava de Login: Se a intenção é LOGIN e não achou a conta, barramos.
            if (context === 'PRO' && intent === 'login') {
                return res.status(404).json({ message: 'Nenhuma conta profissional encontrada com este e-mail. Use a aba "Criar Conta" para começar.' });
            }

            authUser = await prisma.authUser.create({
                data: {
                    email: normalizedEmail,
                    password: null,
                    provider: provider.toUpperCase(),
                },
                select: { 
                    id: true, email: true, provider: true,
                    client: { select: { id: true, name: true } }, 
                    user: { select: { id: true, name: true, role: true } }
                }
            });
        }

        if (context === 'PRO') {
            if (!authUser.user) {
                // Tenta adoção de órfão
                const orphanedUser = await prisma.user.findFirst({
                    where: { email: { equals: normalizedEmail, mode: 'insensitive' }, authUserId: null },
                    include: { ownedBarbershops: true, workedBarbershop: true }
                });

                if (orphanedUser) {
                    const updatedUser = await prisma.user.update({
                        where: { id: orphanedUser.id },
                        data: { authUserId: authUser.id },
                        select: {
                            id: true, name: true, role: true, avatarUrl: true, workedBarbershopId: true,
                            email: true, phone: true,
                            ownedBarbershops: { select: barbershopSelect },
                            workedBarbershop: { select: barbershopSelect }
                        }
                    });
                    authUser.user = updatedUser;
                } else {
                    // Trava de Cadastro: Só cria se a intenção for 'register'
                    if (intent !== 'register') {
                        return res.status(403).json({ message: 'Você ainda não possui um perfil profissional vinculado a este e-mail. Use a aba "Criar Conta".' });
                    }

                    const result = await prisma.$transaction(async (tx) => {
                        const newUser = await tx.user.create({
                            data: {
                                name: name || 'Barbeiro',
                                email: normalizedEmail,
                                role: normalizedEmail === 'marcelogeusti@gmail.com' ? 'SUPER_ADMIN' : 'ADMIN',
                                authUserId: authUser.id,
                                avatarUrl: avatarUrl
                            }
                        });

                        const slug = await generateUniqueSlug(tx, name || 'Minha Barbearia');
                        const newBarbershop = await tx.barbershop.create({
                            data: {
                                name: name ? `${name} Barbearia` : 'Minha Barbearia',
                                commercialName: name ? `${name} Barbearia` : 'Minha Barbearia',
                                slug,
                                ownerId: newUser.id,
                                staff: { connect: { id: newUser.id } },
                                subscriptionStatus: 'TRIAL',
                                trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                            }
                        });

                        // Link user to their shop as their worked/active shop
                        const updatedUser = await tx.user.update({
                            where: { id: newUser.id },
                            data: { workedBarbershopId: newBarbershop.id }
                        });

                        await tx.professional.create({
                            data: {
                                userId: newUser.id,
                                showInApp: true,
                                showPublicly: true,
                                position: 'Proprietário'
                            }
                        });

                        return { user: updatedUser, barbershop: newBarbershop };
                    });

                    authUser.user = {
                        ...result.user,
                        ownedBarbershops: [result.barbershop],
                        workedBarbershop: null
                    };
                }
            } else if (avatarUrl && !authUser.user.avatarUrl) {
                await prisma.user.update({
                    where: { id: authUser.user.id },
                    data: { avatarUrl }
                });
                authUser.user.avatarUrl = avatarUrl;
            }

            const user = authUser.user;

            // --- SELF-HEALING / AUTO-LINKING (ADMIN) ---
            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                if (!user.workedBarbershopId) {
                    const ownedShop = await prisma.barbershop.findFirst({
                        where: { ownerId: user.id }
                    });
                    if (ownedShop) {
                        console.log(`[AUTH] Auto-linking Admin ${user.id} to their owned shop ${ownedShop.id}`);
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { workedBarbershopId: ownedShop.id }
                        });
                        user.workedBarbershopId = ownedShop.id;
                        user.workedBarbershop = { id: ownedShop.id, name: ownedShop.name, slug: ownedShop.slug };
                    }
                }

                // Ensure Professional profile exists
                const professional = await prisma.professional.findUnique({
                    where: { userId: user.id }
                });
                if (!professional) {
                    console.log(`[AUTH] Creating missing Professional profile for Admin ${user.id}`);
                    await prisma.professional.create({
                        data: {
                            userId: user.id,
                            position: 'Proprietário',
                            showInApp: true,
                            showPublicly: true
                        }
                    });
                }
            }
            const token = generateToken(user, authUser);

            const barbershopId = user.workedBarbershopId || user.barbershopId || user.ownedBarbershops?.[0]?.id;
            const barbershopSlug = user.ownedBarbershops?.[0]?.slug || user.workedBarbershop?.slug;

            await createSession(req, authUser.id, token);

            return res.json({
                token,
                user: { 
                    ...user, 
                    email: authUser.email, 
                    role: (authUser.email.toLowerCase() === 'marcelogeusti@gmail.com') ? 'SUPER_ADMIN' : user.role 
                },
                barbershopId,
                barbershopSlug
            });

        } else {
            if (!authUser.client) {
                const newClient = await prisma.client.create({
                    data: {
                        name: name || 'Cliente',
                        authUserId: authUser.id,
                        avatarUrl: avatarUrl,
                        theme: 'dark'
                    }
                });
                authUser.client = newClient;
            } else if (avatarUrl && !authUser.client.avatarUrl) {
                await prisma.client.update({
                    where: { id: authUser.client.id },
                    data: { avatarUrl }
                });
                authUser.client.avatarUrl = avatarUrl;
            }

            const client = authUser.client;
            const token = generateClientToken(client, authUser);

            await createSession(req, authUser.id, token);

            return res.json({
                token,
                user: { ...client, role: 'CLIENT', email: authUser.email }
            });
        }

    } catch (error) {
        console.error('Social Login Error:', error);
        res.status(500).json({ message: 'Erro no login social.' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const authUser = await prisma.authUser.findUnique({ where: { email } });
        if (!authUser) {
            return res.status(200).json({ message: 'Se o email existir, enviamos o link.' });
        }

        const resetToken = jwt.sign(
            { id: authUser.id, purpose: 'RESET_PASSWORD' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        eventBus.emit('PASSWORD_RESET_REQUEST', {
            email: email,
            resetLink: resetLink,
            resetCode: resetToken.substring(resetToken.length - 6).toUpperCase(),
            userId: authUser.id
        });

        res.status(200).json({ message: 'Email de recuperação enviado.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Erro ao processar.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ message: 'Campos obrigatórios.' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.purpose !== 'RESET_PASSWORD') return res.status(400).json({ message: 'Token inválido.' });

        // --- MASTER PROTECTION ---
        const targetAuth = await prisma.authUser.findUnique({ where: { id: decoded.id } });
        if (targetAuth?.email?.toLowerCase() === 'marcelogeusti@gmail.com') {
            return res.status(403).json({ message: 'A senha da conta master não pode ser alterada via sistema.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.authUser.update({
            where: { id: decoded.id },
            data: { password: hashedPassword }
        });

        res.json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        res.status(400).json({ message: 'Token expirado ou inválido.' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const authUserId = req.user.authUserId;

        const authUser = await prisma.authUser.findUnique({ where: { id: authUserId } });
        
        // --- MASTER PROTECTION ---
        if (authUser?.email?.toLowerCase() === 'marcelogeusti@gmail.com') {
            return res.status(403).json({ message: 'A senha da conta master não pode ser alterada via sistema.' });
        }
        if (!authUser || !authUser.password) return res.status(400).json({ message: 'Login social não permite alterar senha aqui.' });

        const isMatch = await bcrypt.compare(currentPassword, authUser.password);
        if (!isMatch) return res.status(400).json({ message: 'Senha atual incorreta.' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.authUser.update({ where: { id: authUserId }, data: { password: hashedPassword } });

        res.json({ message: 'Senha alterada com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao alterar senha.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        if (req.user.role === 'CLIENT') {
            const client = await prisma.client.findUnique({
                where: { id: req.user.id },
                include: { authUser: true }
            });
            if (!client) return res.status(404).json({ message: 'Client not found' });
            res.json({
                id: client.id,
                name: client.name,
                email: client.authUser?.email,
                role: 'CLIENT',
                phone: client.phone,
                avatarUrl: client.avatarUrl,
                authUserId: client.authUserId
            });
        } else {
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: {
                    id: true, name: true, role: true, avatarUrl: true, workedBarbershopId: true,
                    email: true, phone: true,
                    professionalProfile: true, // Assuming this exists or using simple select
                    ownedBarbershops: { 
                        select: { id: true, name: true, slug: true, logoUrl: true, active: true } 
                    }
                }
            });
            if (!user) return res.status(404).json({ message: 'User not found' });
            res.json(user);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.setup2FA = async (req, res) => {
    try {
        const authUserId = req.user.authUserId;
        const { method } = req.body;

        if (method !== 'EMAIL' && method !== 'SMS') return res.status(400).json({ message: 'Método inválido.' });

        const authUser = await prisma.authUser.findUnique({
            where: { id: authUserId },
            include: { client: true, user: true }
        });

        const otp = generateOTP();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.authUser.update({
            where: { id: authUserId },
            data: { twoFactorCode: otp, twoFactorExpires: expires, twoFactorMethod: method }
        });

        const listeners = eventBus.listenerCount('AUTH_2FA_CODE');
        console.log(`[AUTH] setup2FA: Emitting AUTH_2FA_CODE for ${authUser.email}. Listeners: ${listeners}`);

        eventBus.emit('AUTH_2FA_CODE', {
            email: authUser.email,
            otp: otp,
            method: method,
            phone: authUser.client?.phone || authUser.user?.phone,
            userId: authUser.id
        });

        console.log(`[AUTH] setup2FA: Event emitted. Returned response.`);
        res.json({ message: `Código enviado por ${method}.` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao configurar 2FA.' });
    }
};

exports.enable2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const authUserId = req.user.authUserId;

        const authUser = await prisma.authUser.findUnique({ where: { id: authUserId } });
        if (!authUser || authUser.twoFactorCode !== token) return res.status(400).json({ message: 'Código incorreto.' });
        if (new Date() > authUser.twoFactorExpires) return res.status(400).json({ message: 'Código expirado.' });

        await prisma.authUser.update({
            where: { id: authUserId },
            data: { twoFactorEnabled: true, twoFactorCode: null, twoFactorExpires: null }
        });

        res.json({ message: '2FA ativado!', method: authUser.twoFactorMethod });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao ativar 2FA.' });
    }
};

exports.disable2FA = async (req, res) => {
    try {
        await prisma.authUser.update({
            where: { id: req.user.authUserId },
            data: { twoFactorEnabled: false, twoFactorMethod: null }
        });
        res.json({ message: '2FA desativado.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro.' });
    }
};

exports.getAuthStatus = async (req, res) => {
    try {
        const authUser = await prisma.authUser.findUnique({ where: { id: req.user.authUserId } });
        res.json({
            twoFactorEnabled: authUser?.twoFactorEnabled || false,
            twoFactorMethod: authUser?.twoFactorMethod || null
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro.' });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const authUserId = req.user.authUserId;
        await prisma.session.deleteMany({
            where: { authUserId, lastActive: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
        });

        const authHeader = req.headers.authorization;
        const currentToken = authHeader?.split(' ')[1];

        const sessions = await prisma.session.findMany({
            where: { authUserId },
            orderBy: { lastActive: 'desc' }
        });

        res.json(sessions.map(s => ({
            id: s.id,
            deviceInfo: s.deviceInfo,
            ipAddress: s.ipAddress,
            lastActive: s.lastActive,
            isCurrent: s.token === currentToken
        })));
    } catch (error) {
        res.status(500).json({ message: 'Erro ao carregar sessões.' });
    }
};

exports.revokeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await prisma.session.findUnique({ where: { id: sessionId } });
        if (!session || session.authUserId !== req.user.authUserId) return res.status(403).json({ message: 'Não autorizado.' });

        await prisma.session.delete({ where: { id: sessionId } });
        res.json({ message: 'Sessão encerrada.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro.' });
    }
};
