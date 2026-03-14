const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixData() {
    try {
        console.log('--- Fixing Professional Data ---');
        
        const pros = await prisma.user.findMany({
            where: {
                email: { in: ['marcelogeusti@gmail.com', 'rafaelfonseca@gmail.com'] }
            },
            include: { professionalProfile: true }
        });

        for (const p of pros) {
            console.log(`Fixing ${p.name}...`);
            
            // 1. Fix Phone if null
            if (!p.phone) {
                const dummyPhone = p.email.includes('marcelo') ? '11999999999' : '11888888888';
                await prisma.user.update({
                    where: { id: p.id },
                    data: { phone: dummyPhone }
                });
                console.log(`  Set phone to ${dummyPhone}`);
            }

            // 2. Fix Schedules if 0
            if (p.professionalProfile) {
                const count = await prisma.schedule.count({ where: { professionalId: p.professionalProfile.id } });
                if (count === 0) {
                    const days = [1, 2, 3, 4, 5, 6]; // Mon-Sat
                    await prisma.schedule.createMany({
                        data: days.map(d => ({
                            dayOfWeek: d,
                            startTime: '09:00',
                            endTime: '19:00',
                            isOff: false,
                            professionalId: p.professionalProfile.id
                        }))
                    });
                    console.log('  Created 6 default schedules (Mon-Sat 09:00-19:00)');
                }
            }
        }

        console.log('--- DONE ---');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

fixData();
