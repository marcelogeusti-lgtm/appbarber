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
            ownerId: true, 
             trialEndsAt: true
        };

        // --- ULTIMATE BYPASS: Using raw query to avoid Prisma Model Mapping crash ---
        const authUserRaw = await prisma.$queryRaw`
            SELECT id, email, password, provider, "twoFactorEnabled", "twoFactorMethod", "twoFactorCode", "twoFactorExpires" 
            FROM "AuthUser" 
            WHERE email = ${email}
            LIMIT 1
        `;

        const authUser = authUserRaw[0];

        if (!authUser) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // Fetch relations manually with isolation
        authUser.client = await prisma.client.findUnique({ 
            where: { authUserId: authUser.id },
            select: { id: true, name: true, phone: true, avatarUrl: true }
        }).catch(() => null);

        authUser.user = await prisma.user.findUnique({ 
            where: { authUserId: authUser.id },
            select: { id: true, name: true, role: true, avatarUrl: true, workedBarbershopId: true, email: true, phone: true }
        }).catch(() => null);

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

            await prisma.authUser.update({
                where: { id: authUser.id },
                data: { twoFactorCode: null, twoFactorExpires: null }
            });
        }

        // --- MASTER PAYLOAD CONSTRUCTION ---
        const responseData = {
            token: '',
            user: null,
            profiles: {
                professional: authUser.user || null,
                client: authUser.client || null
            },
            role: (email.toLowerCase() === 'marcelogeusti@gmail.com') ? 'SUPER_ADMIN' : (authUser.user?.role || 'CLIENT')
        };

        if (context === 'PRO') {
            if (!authUser.user) {
                return res.status(403).json({ message: 'Esta conta não possui acesso profissional.' });
            }

            const activeUser = authUser.user;

            // --- SELF-HEALING / AUTO-LINKING (ADMIN) ---
            if (responseData.role === 'ADMIN' || responseData.role === 'SUPER_ADMIN') {
                if (!activeUser.workedBarbershopId) {
                    // Try by ownership first
                    let ownedShop = await prisma.barbershop.findFirst({
                        where: { ownerId: activeUser.id }
                    });

                    // MASTER FAILSAFE: If Marcelo and no shop found, force lookup by slug 'next'
                    if (!ownedShop && (email?.toLowerCase() === 'marcelogeusti@gmail.com' || (req.body.email?.toLowerCase() === 'marcelogeusti@gmail.com'))) {
                        ownedShop = await prisma.barbershop.findUnique({
                            where: { slug: 'next' }
                        });
                    }

                    if (ownedShop) {
                        console.log(`[AUTH] Auto-linking Master/Admin ${activeUser.id} to shop ${ownedShop.id} (${ownedShop.slug})`);
                        await prisma.user.update({
                            where: { id: activeUser.id },
                            data: { workedBarbershopId: ownedShop.id }
                        });
                        activeUser.workedBarbershopId = ownedShop.id;
                        activeUser.workedBarbershop = ownedShop; // Sync object
                    }
                }
            }

            // --- POST-LOGIN DATA ENRICHMENT (Shielded) ---
            let barbershop = null;
            try {
                // Fetch barbershop data separately to isolate potential schema mismatches
                const s_barbershopId = activeUser.workedBarbershopId;
                if (s_barbershopId) {
                    barbershop = await prisma.barbershop.findUnique({
                        where: { id: s_barbershopId }
                    });
                } else {
                    const ownedShops = await prisma.barbershop.findMany({
                        where: { ownerId: activeUser.id },
                        take: 1
                    });
                    barbershop = ownedShops[0];
                }
            } catch (pError) {
                console.error('[AUTH SHIELD] Failed to fetch barbershop data, bypassing crash:', pError.message);
            }

            const token = generateToken(activeUser, authUser, barbershop);
            
            // Get barbershop data for response
            const barbershopId = barbershop?.id;
            const barbershopSlug = barbershop?.slug;

            await createSession(req, authUser.id, token);

            responseData.token = token;
            responseData.user = { 
                ...activeUser, 
                role: responseData.role,
                email: authUser.email
            };
            responseData.barbershopId = barbershopId;
            responseData.barbershopSlug = barbershopSlug;
            
            // Inject logo compatibility for backup-restored Sidebar
            if (barbershop) {
                responseData.barbershop = {
                    ...barbershop,
                    logo_url: barbershop.logo_url || barbershop.logoUrl,
                    subscriptionStatus: barbershop.subscriptionStatus || 'TRIAL',
                    saasPlan: barbershop.saasPlan || 'BASIC'
                };
            } else {
                 responseData.barbershop = null;
            }
        } else {
            if (!authUser.client) {
                const newClientProfile = await prisma.client.create({
                    data: {
                        name: authUser.user ? authUser.user.name : 'Novo Cliente',
                        authUserId: authUser.id,
                        theme: 'dark'
                    }
                });
                authUser.client = newClientProfile;
                responseData.profiles.client = newClientProfile;
            }

            const activeClient = authUser.client;
            const token = generateClientToken(activeClient, authUser);

            await createSession(req, authUser.id, token);

            responseData.token = token;
            responseData.user = { ...activeClient, role: 'CLIENT', email: authUser.email };
        }

        return res.json(responseData);

    } catch (error) {
        console.error('------- LOGIN CRITICAL ERROR -------');
        console.error('Email:', email);
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            message: 'Erro interno no servidor.', 
            detail: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
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
            ownerId: true, 
             trialEndsAt: true
        };

        console.log({ stage: "oauth_callback", email: normalizedEmail, provider, status: "checking_identity" });

        // --- ULTIMATE BYPASS: Social Login ---
        let authUser = null;
        try {
            const authUserRaw = await prisma.$queryRaw`
                SELECT id, email, password, provider, "twoFactorEnabled" 
                FROM "AuthUser" 
                WHERE email = ${normalizedEmail}
                LIMIT 1
            `;
            
            if (authUserRaw[0]) {
                authUser = authUserRaw[0];
            } else {
                // Create if not exists (raw or simple create)
                authUser = await prisma.authUser.create({
                    data: {
                        email: normalizedEmail,
                        password: null,
                        provider: provider.toUpperCase()
                    }
                });
            }

            // Enrich relations with isolation
            authUser.client = await prisma.client.findUnique({ 
                where: { authUserId: authUser.id }
            }).catch(() => null);

            authUser.user = await prisma.user.findUnique({ 
                where: { authUserId: authUser.id }
            }).catch(() => null);

        } catch (rawError) {
            console.error('[AUTH SHIELD] OAuth fallback failed:', rawError.message);
            // Last resort: simple fetch
            authUser = await prisma.authUser.findUnique({ where: { email: normalizedEmail } });
        }

        // 2. REDIRECT/FAILSAFE: If context is PRO and intent is login but no user found
        if (!authUser.user && context === 'PRO' && intent === 'login') {
            console.warn({ stage: "oauth_callback", email: normalizedEmail, status: "error", message: "PRO_ACCOUNT_NOT_FOUND" });
            return res.status(404).json({ message: 'Nenhuma conta profissional encontrada com este e-mail.' });
        }

        // --- MASTER PAYLOAD CONSTRUCTION ---
        const responseData = {
            token: '',
            user: null,
            profiles: {
                professional: authUser.user || null,
                client: authUser.client || null
            },
            role: (normalizedEmail === 'marcelogeusti@gmail.com') ? 'SUPER_ADMIN' : (authUser.user?.role || 'CLIENT')
        };

        if (context === 'PRO') {
            if (!authUser.user) {
                // Tenta encontrar um perfil profissional órfão (cadastrado por e-mail mas sem AuthUser)
                const orphanedUser = await prisma.user.findFirst({
                    where: { email: { equals: normalizedEmail, mode: 'insensitive' }, authUserId: null },
                    include: { ownedBarbershops: { select: barbershopSelect }, workedBarbershop: { select: barbershopSelect } }
                });

                if (orphanedUser) {
                    console.log(`[AUTH] Adopting orphaned Pro User ${orphanedUser.id} for email ${normalizedEmail}`);
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
                    responseData.profiles.professional = updatedUser;
                } else {
                    // SEGUNDA TRAVA: Só criamos Barbeiro/Barbearia se a intenção for explicitamente de Cadastro
                    if (intent !== 'register') {
                        return res.status(403).json({ message: 'Você ainda não possui um perfil profissional vinculado a este e-mail. Use a aba "Criar Conta" para começar.' });
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

                        console.log({ stage: "oauth_callback", email: normalizedEmail, status: "creating_barbershop" });
                        const slug = await generateUniqueSlug(tx, name || 'Minha Barbearia');
                        const newBarbershop = await tx.barbershop.create({
                            data: {
                                name: name ? `${name} Barbearia` : 'Minha Barbearia',
                                commercialName: name ? `${name} Barbearia` : 'Minha Barbearia',
                                slug,
                                ownerId: newUser.id,
                                staff: { connect: { id: newUser.id } },
                                // STRIPE RULE: Dual-write to Enum and Legacy fields
                                subscriptionStatus: 'TRIAL',
                                trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                            }
                        });

                        // Link user to their shop as their worked/active shop
                        await tx.user.update({
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

                        return { id: newUser.id, name: newUser.name, role: newUser.role, workedBarbershopId: newBarbershop.id, ownedBarbershops: [newBarbershop] };
                    });

                    authUser.user = result;
                    responseData.profiles.professional = result;
                }
            } else if (avatarUrl && !authUser.user.avatarUrl) {
                await prisma.user.update({
                    where: { id: authUser.user.id },
                    data: { avatarUrl }
                });
                authUser.user.avatarUrl = avatarUrl;
            }

            const activeUser = authUser.user;

            // --- SELF-HEALING / AUTO-LINKING (ADMIN) ---
            if (responseData.role === 'ADMIN' || responseData.role === 'SUPER_ADMIN') {
                if (!activeUser.workedBarbershopId) {
                    // Try by ownership first
                    let ownedShop = await prisma.barbershop.findFirst({
                        where: { ownerId: activeUser.id }
                    });

                    // MASTER FAILSAFE: If Marcelo and no shop found, force lookup by slug 'next'
                    if (!ownedShop && (email?.toLowerCase() === 'marcelogeusti@gmail.com' || (req.body.email?.toLowerCase() === 'marcelogeusti@gmail.com'))) {
                        ownedShop = await prisma.barbershop.findUnique({
                            where: { slug: 'next' }
                        });
                    }

                    if (ownedShop) {
                        console.log(`[AUTH] Auto-linking Master/Admin ${activeUser.id} to shop ${ownedShop.id} (${ownedShop.slug})`);
                        await prisma.user.update({
                            where: { id: activeUser.id },
                            data: { workedBarbershopId: ownedShop.id }
                        });
                        activeUser.workedBarbershopId = ownedShop.id;
                        activeUser.workedBarbershop = ownedShop; // Sync object
                    }
                }
            }
            const token = generateToken(activeUser, authUser);

            const barbershop = activeUser.workedBarbershop || activeUser.ownedBarbershops?.[0];
            const barbershopId = barbershop?.id;
            const barbershopSlug = barbershop?.slug;

            await createSession(req, authUser.id, token);

            responseData.token = token;
            responseData.user = { 
                ...professional, 
                email: authUser.email, 
                role: responseData.role 
            };
            responseData.barbershopId = professional.workedBarbershopId;

            // --- POST-LOGIN DATA ENRICHMENT (Shielded) ---
            let barbershop = null;
            try {
                // Fetch barbershop data separately to isolate potential schema mismatches
                const s_barbershopId = professional.workedBarbershopId;
                if (s_barbershopId) {
                    barbershop = await prisma.barbershop.findUnique({
                        where: { id: s_barbershopId }
                    });
                } else {
                    const ownedShops = await prisma.barbershop.findMany({
                        where: { ownerId: professional.id },
                        take: 1
                    });
                    barbershop = ownedShops[0];
                }
            } catch (pError) {
                console.error('[AUTH SHIELD] Failed to fetch barbershop data, bypassing crash:', pError.message);
            }

            responseData.barbershop = barbershop ? {
                ...barbershop,
                logo_url: barbershop.logo_url || barbershop.logoUrl,
                subscriptionStatus: barbershop.subscriptionStatus || 'TRIAL',
                saasPlan: barbershop.saasPlan || 'BASIC'
            } : null;

            return res.json(responseData);

        } else {
            if (!authUser.client) {
                console.log({ stage: "oauth_callback", email: normalizedEmail, status: "creating_client_profile" });
                // ATOMIC UPSERT: Client Profile
                const newClientProfile = await prisma.client.upsert({
                    where: { authUserId: authUser.id },
                    update: {
                        name: name || 'Cliente',
                        avatarUrl: avatarUrl
                    },
                    create: {
                        name: name || 'Cliente',
                        authUserId: authUser.id,
                        avatarUrl: avatarUrl,
                        theme: 'dark'
                    }
                });
                authUser.client = newClientProfile;
                responseData.profiles.client = newClientProfile;
            } else if (avatarUrl && !authUser.client.avatarUrl) {
                await prisma.client.update({
                    where: { id: authUser.client.id },
                    data: { avatarUrl }
                });
                authUser.client.avatarUrl = avatarUrl;
            }

            const activeClient = authUser.client;
            const token = generateClientToken(activeClient, authUser);

            await createSession(req, authUser.id, token);

            responseData.token = token;
            responseData.user = { ...activeClient, role: 'CLIENT', email: authUser.email };

            return res.json(responseData);
        }

    } catch (error) {
        console.error('------- SOCIAL LOGIN CRITICAL ERROR -------');
        console.error('Body:', req.body);
        console.error('Error Stack:', error.stack);
        console.error('Prisma Code:', error.code);
        
        let message = 'Erro no login social.';
        if (error.code === 'P2002') message = 'Uma conta com este e-mail já existe com um método de login diferente.';
        
        res.status(500).json({ 
            message,
            detail: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
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
                        select: { id: true, name: true, slug: true, logoUrl: true } 
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
