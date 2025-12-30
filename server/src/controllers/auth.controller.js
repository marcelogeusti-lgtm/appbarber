const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const generateToken = (user) => {
    // Attempt to find barbershopId in relations or root
    const barbershopId = user.workedBarbershopId ||
        user.barbershopId ||
        (user.ownedBarbershops && user.ownedBarbershops[0]?.id) ||
        (user.barbershop && user.barbershop.id);

    return jwt.sign(
        { id: user.id, role: user.role, barbershopId: barbershopId || null },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

exports.register = async (req, res) => {
    try {
        const { name, email, password, role, barbershopName } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // If registering as a new Barbershop Owner (Admin)
        if (role === 'ADMIN' && barbershopName) {
            // Create User and Barbershop in transaction
            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: 'ADMIN'
                    }
                });

                const slug = barbershopName.toLowerCase().replace(/\s+/g, '-');

                const barbershop = await tx.barbershop.create({
                    data: {
                        name: barbershopName,
                        slug,
                        ownerId: user.id,
                        staff: { connect: { id: user.id } } // Owner is also staff? Optional
                    }
                });

                return { user, barbershop };
            });

            const token = generateToken(result.user);
            return res.status(201).json({ token, user: result.user, barbershop: result.barbershop });
        }

        // Regular User (Client)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'CLIENT'
            }
        });

        const token = generateToken(user);
        res.status(201).json({ token, user });

    } catch (error) {
        console.error('Detailed Register Error:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                ownedBarbershops: true,
                workedBarbershop: true
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        // Remove password from response
        delete user.password;

        res.json({ token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, ownedBarbershops: true, workedBarbershop: true }
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}
