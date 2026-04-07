const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shops = await prisma.barbershop.findMany({
            take: 2,
            include: {
                services: {
                    where: { active: true },
                    take: 5
                },
                staff: {
                    take: 5
                }
            }
        });

        console.log('--- DB DIAGNOSTIC ---');
        shops.forEach(shop => {
            console.log(`\nShop: ${shop.name} (${shop.id})`);
            console.log('  Services:');
            shop.services.forEach(s => console.log(`    - ${s.name} (${s.id})`));
            console.log('  Staff:');
            shop.staff.forEach(p => console.log(`    - ${p.name} (${p.id}) [Role: ${p.role}]`));
        });
    } catch (e) {
        console.error('Error in diagnostic:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
