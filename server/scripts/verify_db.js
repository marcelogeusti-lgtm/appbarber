const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Verifying Database Integrity ---');

    // 1. Check Barbershops
    const shops = await prisma.barbershop.findMany({
        include: { owner: true }
    });
    console.log(`Found ${shops.length} Barbershops:`);
    shops.forEach(s => {
        console.log(`- [${s.id}] Name: "${s.name}", Slug: "${s.slug}", Owner: ${s.owner?.email}`);
    });

    if (shops.length === 0) {
        console.error('CRITICAL: No barbershops found!');
    }

    // 2. Check Users with BarbershopId
    const users = await prisma.user.findMany({
        where: { role: 'ADMIN' }, // Assuming admin is owner
        take: 5
    });
    console.log(`\nChecking Admin Users:`);
    users.forEach(u => {
        console.log(`- [${u.id}] ${u.email} (Role: ${u.role}) -> WorkedBarbershopId: ${u.workedBarbershopId}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
