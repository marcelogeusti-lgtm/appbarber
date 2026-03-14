const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- DATABASE FULL CHECK ---');
    try {
        const shops = await prisma.barbershop.findMany({
            include: {
                _count: {
                    select: {
                        services: true,
                        staff: true,
                        appointments: true
                    }
                }
            }
        });

        console.log('Total Barbershops found:', shops.length);
        shops.forEach(s => {
            console.log(`\n- SHOP: ${s.name} (${s.id}) [Slug: ${s.slug}]`);
            console.log(`  Services: ${s._count.services}`);
            console.log(`  Professionals: ${s._count.staff}`);
            console.log(`  Appointments: ${s._count.appointments}`);
        });

        const totalApps = await prisma.appointment.count();
        console.log('\n--- TOTAL APPOINTMENTS IN DB:', totalApps);

    } catch (e) {
        console.error('Error during check:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
