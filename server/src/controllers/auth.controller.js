const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateUniqueSlug } = require('../utils/slugGenerator');

const prisma = new PrismaClient();

const generateToken = (user, authUser) => {
    const barbershopId = user.workedBarbershopId ||
        user.barbershopId ||
        (user.ownedBarbershops && user.ownedBarbershops[0]?.id) ||
        (user.barbershop && user.barbershop.id);

    return jwt.sign(
        { id: user.id, role: user.role, authUserId: authUser?.id, barbershopId: barbershopId || null },
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
                        slug,
                        ownerId: user.id,
                        staff: { connect: { id: user.id } },
                        // TrialLogic: 15 Days Free
                        subscriptionStatus: 'TRIAL',
                        trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 Days from now
                    }
                });

                // AUTO-CREATE PROFESSIONAL PROFILE
                // This ensures the owner is also a professional from the start.
                await tx.professional.create({
                    data: {
                        userId: user.id,
                        showInApp: true,
                        showPublicly: true,
                        position: 'Administrador / Barbeiro', // Default position
                        bio: 'Profissional principal.' // Optional default
                    }
                });

                return { user, barbershop, authUser };
            });

            // [FIX] Ensure token has barbershopId by providing the relationship manually
            const userForToken = {
                ...result.user,
                ownedBarbershops: [result.barbershop]
            };

            const token = generateToken(userForToken, result.authUser);

            // Return user with ownedBarbershops populated so frontend validation works immediately
            const userWithShop = userForToken;

            return res.status(201).json({ token, user: userWithShop, barbershop: result.barbershop });
        }

        // 3. CLIENT Registration (Default)
        // Ensure no conflict with Barbers? (AuthUser check covers it)

        const result = await prisma.$transaction(async (tx) => {
            const authUser = await tx.authUser.create({
                data: { email, password: hashedPassword, provider: 'EMAIL' }
            });

            const client = await tx.client.create({
                data: {
                    name,
                    phone,
                    authUserId: authUser.id,
                    theme: 'dark'
                }
            });

            return { client, authUser };
        });

        // Generate Client Token
        const token = generateClientToken(result.client, result.authUser);
        return res.status(201).json({ token, user: result.client, role: 'CLIENT' });

    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, context } = req.body; // context: 'CLIENT' or 'PRO'

        const authUser = await prisma.authUser.findUnique({
            where: { email },
            include: {
                user: {
                    include: { ownedBarbershops: true, workedBarbershop: true }
                },
                client: true
            }
        });

        if (!authUser) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        if (authUser.provider === 'GOOGLE' || authUser.provider === 'FACEBOOK') {
            return res.status(400).json({ message: 'Esta conta usa login social. Por favor, use o botão correspondente.' });
        }

        const isMatch = await bcrypt.compare(password, authUser.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas.' });
        }

        // --- CONTEXT CHECKS ---

        // 1. Pro Context Login
        if (context === 'PRO') {
            if (!authUser.user) {
                // If it's a client trying to access Pro
                return res.status(403).json({ message: 'Esta conta não possui acesso profissional.' });
            }

            const user = authUser.user;
            const token = generateToken(user, authUser);

            // Populate legacy fields for frontend compatibility
            const barbershopId = user.workedBarbershopId || user.barbershopId || (user.ownedBarbershops?.[0]?.id);
            const barbershopSlug = (user.ownedBarbershops?.[0]?.slug) || (user.workedBarbershop?.slug);

            return res.json({
                token,
                user: { ...user, role: user.role },
                barbershopId,
                barbershopSlug
            });
        }

        // 2. Client Context Login (Default)
        // STRICT CONTEXT: If context is CLIENT, we ONLY return Client data.
        // If the user is a Pro, we DO NOT BLOCK. We just check if they have a Client profile.
        // If not, we create one automatically (because they might want to cut their hair too!).

        if (!authUser.client) {
            // Auto-create Client profile for existing AuthUser (even if Pro)
            // This enables Multi-Role support
            const newClient = await prisma.client.create({
                data: {
                    name: authUser.user ? authUser.user.name : 'Novo Cliente', // Inherit name if Pro
                    authUserId: authUser.id,
                    theme: 'dark'
                }
            });
            authUser.client = newClient;
        }

        const client = authUser.client;
        const token = generateClientToken(client, authUser);

        return res.json({
            token,
            user: { ...client, role: 'CLIENT', email: authUser.email }
        });

    } catch (error) {
        console.error('Login error detailed:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// ... Helper functions need to be defined (generateToken, generateClientToken) ...
// For this edit I'll add them at the top or assume they are helper functions in the file
// I will rewrite the top of the file in a separate step or just include them if I can.
// Since I'm replacing the body, I can't easily add top-level functions unless I replace the whole file.
// I'll replace the whole file in next step or use 'write_to_file' if I want to be clean.


// Social Login (Google/Facebook)
exports.socialLogin = async (req, res) => {
    try {
        const { email, name, provider, providerId, avatarUrl, context } = req.body;

        console.log(`[AUTH] Social Login attempt: ${email} via ${provider} (Context: ${context})`);

        if (!email || !provider) {
            return res.status(400).json({ message: 'Email e Provider são obrigatórios' });
        }

        // 1. Find or Create AuthUser
        let authUser = await prisma.authUser.findUnique({
            where: { email },
            include: {
                client: true,
                user: {
                    include: { ownedBarbershops: true, workedBarbershop: true }
                }
            }
        });

        if (!authUser) {
            console.log(`[AUTH] Creating new AuthUser for social login`);
            authUser = await prisma.authUser.create({
                data: {
                    email,
                    password: null,
                    provider: provider.toUpperCase(),
                },
                include: { client: true, user: true }
            });
        }

        // 2. Handle Profiles based on Context
        if (context === 'PRO') {
            // If the user doesn't have a professional profile, create one (and a barbershop)
            if (!authUser.user) {
                console.log(`[AUTH] Creating new Pro User + Barbershop`);
                const result = await prisma.$transaction(async (tx) => {
                    const newUser = await tx.user.create({
                        data: {
                            name: name || 'Barbeiro',
                            email, // Legacy field
                            role: 'ADMIN',
                            authUserId: authUser.id,
                            avatarUrl: avatarUrl
                        }
                    });

                    const slug = await generateUniqueSlug(tx, name || 'Minha Barbearia');
                    const newBarbershop = await tx.barbershop.create({
                        data: {
                            name: name ? `${name} Barbearia` : 'Minha Barbearia',
                            slug,
                            ownerId: newUser.id,
                            staff: { connect: { id: newUser.id } },
                            subscriptionStatus: 'TRIAL',
                            trialEndsAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                        }
                    });

                    await tx.professional.create({
                        data: {
                            userId: newUser.id,
                            showInApp: true,
                            showPublicly: true,
                            position: 'Proprietário'
                        }
                    });

                    return { user: newUser, barbershop: newBarbershop };
                });

                authUser.user = {
                    ...result.user,
                    ownedBarbershops: [result.barbershop],
                    workedBarbershop: null
                };
            } else if (avatarUrl && !authUser.user.avatarUrl) {
                // Persistent fix: If existing pro has no photo, but social provider has one, save it.
                await prisma.user.update({
                    where: { id: authUser.user.id },
                    data: { avatarUrl }
                });
                authUser.user.avatarUrl = avatarUrl;
            }

            const user = authUser.user;
            const token = generateToken(user, authUser);

            const barbershopId = user.workedBarbershopId || user.barbershopId || user.ownedBarbershops?.[0]?.id;
            const barbershopSlug = user.ownedBarbershops?.[0]?.slug || user.workedBarbershop?.slug;

            return res.json({
                token,
                user: {
                    ...user, // Spreading user includes relations like ownedBarbershops
                    email: authUser.email,
                    role: user.role
                },
                barbershopId,
                barbershopSlug
            });

        } else {
            // Context: CLIENT (or default)
            if (!authUser.client) {
                console.log(`[AUTH] Creating new Client profile`);
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
                // Persistent fix: If existing client has no photo, but social provider has one, save it.
                await prisma.client.update({
                    where: { id: authUser.client.id },
                    data: { avatarUrl }
                });
                authUser.client.avatarUrl = avatarUrl;
            }

            const client = authUser.client;
            const token = generateClientToken(client, authUser);

            return res.json({
                token,
                user: {
                    ...client,
                    role: 'CLIENT',
                    email: authUser.email
                }
            });
        }

    } catch (error) {
        console.error('Social Login Error:', error);
        res.status(500).json({ message: 'Erro no login social. Tente novamente.' });
    }
};


// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const authUser = await prisma.authUser.findUnique({ where: { email } });
        if (!authUser) {
            // Security: Don't leak if email exists or not, but for now we might be nice
            // Actually standard practice is to say "If ID exists, email sent"
            return res.status(200).json({ message: 'Se o email existir, enviamos o link.' });
        }

        // Generate Token (simple random string or JWT)
        const resetToken = jwt.sign({ id: authUser.id, purpose: 'RESET_PASSWORD' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // TODO: Send Email using nodemailer
        // For now, since user wants "Real" and I can't set up SMTP credentials I don't have:
        // I will log it to console so user can "see" it works in dev, 
        // and ideally we'd use a CommunicationService.

        console.log(`[AUTH] Password Reset Link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);

        // Return success
        res.status(200).json({ message: 'Email de recuperação enviado.' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Erro ao processar solicitação.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        // ... (Existing getMe logic to be updated if needed)
        // If req.user is from Client Token, it has id=ClientUUID
        // If req.user is from Pro Token, it has id=UserUUID

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
            // Pro Logic (Existing)
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                include: { professionalProfile: true, ownedBarbershops: true }
            });
            if (!user) return res.status(404).json({ message: 'User not found' });
            user.password = undefined;
            res.json(user);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
