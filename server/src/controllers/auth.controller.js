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
                        staff: { connect: { id: user.id } }
                    }
                });

                return { user, barbershop, authUser };
            });

            const token = generateToken(result.user, result.authUser);
            return res.status(201).json({ token, user: result.user, barbershop: result.barbershop });
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
        if (authUser.user) {
            // "Se existir em barbers -> BLOQUEAR acesso. Mensagem clara."
            return res.status(403).json({ message: 'Esta conta é profissional. Use outro e-mail para acessar como cliente ou use o App Pro.' });
        }

        if (!authUser.client) {
            // Should not happen if data integrity is good, but maybe incomplete reg
            return res.status(400).json({ message: 'Perfil de cliente não encontrado.' });
        }

        const client = authUser.client;
        const token = generateClientToken(client, authUser);

        return res.json({
            token,
            user: { ...client, role: 'CLIENT', email: authUser.email }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
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
        // Payload from Frontend (Firebase/Google Identity)
        const { email, name, provider, providerId, avatarUrl } = req.body;

        if (!email || !provider) {
            return res.status(400).json({ message: 'Email e Provider são obrigatórios' });
        }

        // 1. Find AuthUser
        let authUser = await prisma.authUser.findUnique({
            where: { email },
            include: { client: true, user: true }
        });

        if (authUser) {
            // User exists
            // Security Check: If existing provider is different?
            // If existing is EMAIL, we might allow social login if trust is high.
            // Ideally we check if `provider` matches or if we support linking.
            // For now: Allow login but update avatar if missing?

            // Check Context blocks
            if (authUser.user) {
                // If Pro tries to login via Social Client App -> Block
                return res.status(403).json({
                    message: 'Esta conta é profissional. Use o App Pro ou email/senha.'
                });
            }

            // Update info if new
            if (!authUser.client) {
                // Should exist if AuthUser exists? 
                // Maybe it was a Pro before? But we blocked Pro above.
                // Create Client profile if missing
                const client = await prisma.client.create({
                    data: {
                        name: name || 'Cliente',
                        authUserId: authUser.id,
                        avatarUrl: avatarUrl
                    }
                });
                authUser.client = client;
            }
        } else {
            // 2. Register New User (Social)
            // Transaction
            const result = await prisma.$transaction(async (tx) => {
                const newAuth = await tx.authUser.create({
                    data: {
                        email,
                        password: null, // No password for social
                        provider: provider.toUpperCase(), // GOOGLE, FACEBOOK
                    }
                });

                const newClient = await tx.client.create({
                    data: {
                        name: name || 'Novo Cliente',
                        authUserId: newAuth.id,
                        avatarUrl: avatarUrl,
                        theme: 'dark'
                    }
                });
                return { authUser: newAuth, client: newClient };
            });
            authUser = result.authUser;
            authUser.client = result.client;
        }

        const token = generateClientToken(authUser.client, authUser);

        res.json({
            token,
            user: {
                id: authUser.client.id,
                name: authUser.client.name,
                email: authUser.email,
                role: 'CLIENT',
                avatarUrl: authUser.client.avatarUrl
            }
        });

    } catch (error) {
        console.error('Social Login Error:', error);
        res.status(500).json({ message: 'Erro no login social' });
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
                avatarUrl: client.avatarUrl
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
