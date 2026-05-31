const prisma = require('../lib/prisma');

exports.createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        let clientId = req.user.id; 
        
        // If user is not CLIENT, we need to find their Client ID using authUserId
        if (req.user.role !== 'CLIENT') {
            const authUserId = req.user.authUserId || req.user.id;
            const clientProfile = await prisma.client.findFirst({
                where: { authUserId: authUserId }
            });
            if (!clientProfile) {
                return res.status(403).json({ message: 'Você precisa de um perfil de cliente para avaliar.' });
            }
            clientId = clientProfile.id;
        }

        if (!clientId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Validate appointment
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { review: true } // Check if already reviewed
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        if (appointment.clientId !== clientId) {
            return res.status(403).json({ message: 'Você não tem permissão para avaliar este agendamento.' });
        }

        if (appointment.status !== 'COMPLETED' && appointment.status !== 'CONFIRMED') { // Allow reviewing confirmed? Maybe only completed.
            // Ideally only completed, but let's stick to user request "linked to real appointment"
        }

        if (appointment.review) {
            return res.status(400).json({ message: 'Appointment already reviewed' });
        }

        // Enforce 1 review per user per barbershop
        const existingReview = await prisma.review.findFirst({
            where: { clientId: clientId, barbershopId: appointment.barbershopId }
        });

        if (existingReview) {
            return res.status(400).json({ message: 'Você já avaliou esta barbearia. É permitida apenas uma avaliação por usuário.' });
        }

        const review = await prisma.review.create({
            data: {
                rating: parseInt(rating),
                comment,
                appointmentId,
                clientId,
                barbershopId: appointment.barbershopId
            }
        });

        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating review' });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        if (!barbershopId) return res.status(400).json({ message: 'Barbershop ID required' });

        const reviews = await prisma.review.findMany({
            where: { barbershopId },
            include: {
                client: {
                    select: { name: true, avatarUrl: true }
                },
                appointment: {
                    include: {
                        service: { select: { name: true } },
                        professional: { select: { name: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};
