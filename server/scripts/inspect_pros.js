const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectPro() {
    try {
        console.log('--- Professional Inspection ---');
        
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
            console.log(`User: ${p.name} (${p.email}) | ID: ${p.id} | Role: ${p.role}`);
            if (p.professionalProfile) {
                console.log(`  Profile ID: ${p.professionalProfile.id}`);
                console.log(`  Schedules Count: ${p.professionalProfile.schedules.length}`);
                p.professionalProfile.schedules.forEach(s => {
                    console.log(`    - Day ${s.dayOfWeek}: ${s.startTime}-${s.endTime} (Off: ${s.isOff})`);
                });
            } else {
                console.log('  !! No Professional Profile !!');
            }
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

inspectPro();
