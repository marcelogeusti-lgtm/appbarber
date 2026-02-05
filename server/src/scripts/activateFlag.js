const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function activateFlag() {
    const barbershopId = '94dad01c-504e-4f93-bcfe-5371d5a7ee50';
    const flagKey = 'booking_buffer';

    try {
        const flag = await prisma.featureFlag.upsert({
            where: { key_barbershopId: { key: flagKey, barbershopId: barbershopId } },
            update: { enabled: true },
            create: {
                key: flagKey,
                enabled: true,
                barbershopId: barbershopId,
                description: 'Trava de 15min para agendamentos no dia (Teste Master)'
            }
        });
        console.log('FLAG_STATUS:', JSON.stringify(flag));
    } catch (error) {
        // Fallback if the unique constraint is different
        console.log('Error, trying simple create...');
        try {
            const flag = await prisma.featureFlag.create({
                data: {
                    key: flagKey,
                    enabled: true,
                    barbershopId: barbershopId,
                    description: 'Trava de 15min para agendamentos no dia (Teste Master)'
                }
            });
            console.log('FLAG_STATUS:', JSON.stringify(flag));
        } catch (e) {
            console.error('Failed to set flag:', e.message);
        }
    } finally {
        await prisma.$disconnect();
    }
}

activateFlag();
