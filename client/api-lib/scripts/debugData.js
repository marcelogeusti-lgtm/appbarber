const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
    const shops = await prisma.barbershop.findMany({
        include: {
            services: true,
            staff: { select: { id: true, name: true, role: true } }
        }
    });

    console.log(`Found ${shops.length} shops.`);
    shops.forEach(s => {
        console.log(`\nShop: ${s.name} (${s.id})`);
        console.log(`-- Services (${s.services.length}):`);
        s.services.forEach(sv => console.log(`   - [${sv.active ? 'ACTIVE' : 'INACTIVE'}] ${sv.name} (${sv.id})`));
        console.log(`-- Staff (${s.staff.length}):`);
        s.staff.forEach(st => console.log(`   - [${st.role}] ${st.name} (${st.id})`));
    });
    await prisma.$disconnect();
}

inspect();
