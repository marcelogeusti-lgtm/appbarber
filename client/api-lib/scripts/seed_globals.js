const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedGlobals() {
    try {
        await prisma.featureFlag.upsert({
            where: { key_barbershopId: { key: 'booking_buffer', barbershopId: null } },
            update: {},
            create: {
                key: 'booking_buffer',
                enabled: false,
                description: 'Trava de segurança de 15 minutos para agendamentos no mesmo dia.'
            }
        });
        console.log('SUCCESS: Global booking_buffer flag initialized.');
    } catch (error) {
        console.error('ERROR seeding globals:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedGlobals();
