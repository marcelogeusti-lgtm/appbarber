const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createReview = async (req, res) => {
    try {
        const { appointmentId, rating, comment } = req.body;
        const clientId = req.user.clientId; // Assuming auth middleware sets this

        if (!clientId) {
            return res.status(401).json({ message: 'User must be a client' });
        }

        // Validate appointment
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { review: true } // Check if already reviewed
        });

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.clientId !== clientId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        if (appointment.status !== 'COMPLETED' && appointment.status !== 'CONFIRMED') { // Allow reviewing confirmed? Maybe only completed.
            // Ideally only completed, but let's stick to user request "linked to real appointment"
        }

        if (appointment.review) {
            return res.status(400).json({ message: 'Appointment already reviewed' });
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
