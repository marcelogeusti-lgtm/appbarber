const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create System Admin
    // (Optional, usually SaaS owner)

    // 2. Create Barbershop Owner (Admin)
    const ownerPassword = await bcrypt.hash('123456', 10);
    const owner = await prisma.user.create({
        data: {
            name: 'Marcelo Geusti',
            email: 'owner@barber.com',
            password: ownerPassword,
            role: 'ADMIN', // Owner is admin of his shop
        }
    });

    // 3. Create Barbershop
    const barbershop = await prisma.barbershop.create({
        data: {
            name: 'Barbearia Geusti',
            slug: 'barbearia-geusti',
            address: 'Rua Principal, 123',
            phone: '11999999999',
            ownerId: owner.id,
            staff: { connect: { id: owner.id } } // Connect owner as staff too
        }
    });

    // Set owner is working at this shop
    await prisma.user.update({
        where: { id: owner.id },
        data: { workedBarbershopId: barbershop.id }
    });

    // Create Professional Profile for Owner
    const proProfile = await prisma.professional.create({
        data: {
            userId: owner.id,
            bio: 'Master Barber with 10 years experience.'
        }
    });

    // Add Schedule
    await prisma.schedule.createMany({
        data: [
            { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', professionalId: proProfile.id },
            { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', professionalId: proProfile.id },
            { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', professionalId: proProfile.id },
            { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', professionalId: proProfile.id },
            { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', professionalId: proProfile.id }, // Friday
            { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', professionalId: proProfile.id }, // Saturday
        ]
    });

    console.log(`✅ Created Barbershop: ${barbershop.name}`);

    // 4. Create Service
    const service = await prisma.service.create({
        data: {
            name: 'Corte Degradê',
            description: 'Corte moderno com acabamento na navalha',
            price: 35.00,
            duration: 30,
            barbershopId: barbershop.id
        }
    });

    // 5. Create Client
    const clientPassword = await bcrypt.hash('123456', 10);
    const client = await prisma.user.create({
        data: {
            name: 'João Cliente',
            email: 'client@email.com',
            password: clientPassword,
            role: 'CLIENT'
        }
    });

    // 6. Create Appointment
    const today = new Date();
    today.setHours(10, 0, 0, 0); // 10:00 AM today (or tomorrow if late)

    if (today < new Date()) {
        today.setDate(today.getDate() + 1);
    }

    await prisma.appointment.create({
        data: {
            date: today,
            clientId: client.id,
            professionalId: owner.id,
            serviceId: service.id,
            barbershopId: barbershop.id,
            status: 'PENDING'
        }
    });

    console.log('✅ Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
