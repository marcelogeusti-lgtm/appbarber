const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectPro() {
    try {
        console.log('--- Detailed Professional Inspection ---');
        
        const pros = await prisma.user.findMany({
            where: {
                role: { in: ['BARBER', 'ADMIN', 'SUPER_ADMIN', 'BARBER_CONSULTA'] }
            },
            include: {
                professionalProfile: {
                    include: {
                        schedules: true,
                        services: true
                    }
                }
            }
        });

        pros.forEach(p => {
            console.log(`User: ${p.name} (${p.email})`);
            console.log(`  ID: ${p.id}`);
            console.log(`  Phone: ${p.phone}`);
            console.log(`  Role: ${p.role}`);
            if (p.professionalProfile) {
                console.log(`  Position: "${p.professionalProfile.position}" (Length: ${p.professionalProfile.position?.length || 0})`);
                console.log(`  Schedules Count: ${p.professionalProfile.schedules.length}`);
                console.log(`  Services Count: ${p.professionalProfile.services.length}`);
            } else {
                console.log('  !! No Professional Profile Record !!');
            }
            console.log('-----------------------------------');
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectPro();
