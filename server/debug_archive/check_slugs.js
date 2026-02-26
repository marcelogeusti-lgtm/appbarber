const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const shops = await prisma.barbershop.findMany({
            select: { id: true, name: true, slug: true }
        });

        console.log('--- Shops and Slugs ---');
        for (const s of shops) {
            console.log(`${s.name} | ID: ${s.id} | Slug: ${s.slug}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
