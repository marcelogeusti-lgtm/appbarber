const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
    const barbershopId = '8b3fcfd4-309c-4e24-9004-e03492986be4'; // From Marcelo's record

    const pros = await prisma.user.findMany({
        where: {
            workedBarbershopId: barbershopId,
            role: { in: ['BARBER', 'ADMIN', 'SUPER_ADMIN', 'BARBER_CONSULTA'] }
        },
        include: {
            professionalProfile: true
        }
    });

    console.log(`Found ${pros.length} professionals.`);
    pros.forEach(p => {
        console.log(`- ${p.name} (Role: ${p.role})`);
    });

    const isMarceloIncluded = pros.some(p => p.email === 'marcelogeusti@gmail.com');
    console.log('Is Marcelo included?', isMarceloIncluded);
}

verify().catch(console.error).finally(() => prisma.$disconnect());
