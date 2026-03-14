const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sweep() {
    try {
        console.log('--- SYSTEM SWEEP ---');
        
        const shops = await prisma.barbershop.findMany({
            include: {
                owner: { select: { id: true, email: true, name: true } },
                staff: { select: { id: true, name: true, role: true } }
            }
        });
        
        console.log(`Total Shops: ${shops.length}`);
        shops.forEach(s => {
            console.log(`Shop: ${s.name} (UUID: ${s.id})`);
            console.log(`  Owner: ${s.owner?.email || 'NONE'}`);
            console.log(`  Staff Count: ${s.staff.length}`);
            s.staff.forEach(st => console.log(`    - ${st.name} (${st.role})`));
        });

        const usersCount = await prisma.user.count();
        console.log(`Total Users: ${usersCount}`);

        const appointmentsCount = await prisma.appointment.count();
        console.log(`Total Appointments: ${appointmentsCount}`);

        const ordersCount = await prisma.order.count();
        console.log(`Total Orders: ${ordersCount}`);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

sweep();
