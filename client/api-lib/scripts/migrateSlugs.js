const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sanitizeSlug = (s) => s.toLowerCase()
    .normalize('NFD') // Decompose combined characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end

async function migrate() {
    try {
        console.log('Starting Slug Migration...');
        const barbershops = await prisma.barbershop.findMany();

        for (const shop of barbershops) {
            const cleanSlug = sanitizeSlug(shop.slug || shop.name);

            if (cleanSlug !== shop.slug) {
                console.log(`Migrating: "${shop.slug}" -> "${cleanSlug}"`);

                // Check collision
                const exists = await prisma.barbershop.findUnique({ where: { slug: cleanSlug } });
                if (exists && exists.id !== shop.id) {
                    console.warn(`SKIPPING: Collision for ${cleanSlug} (ID: ${shop.id} vs ${exists.id})`);
                    continue;
                }

                await prisma.barbershop.update({
                    where: { id: shop.id },
                    data: { slug: cleanSlug }
                });
            }
        }
        console.log('Migration Complete.');
    } catch (e) {
        console.error('Migration Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
