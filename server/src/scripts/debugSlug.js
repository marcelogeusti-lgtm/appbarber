const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sanitizeSlug = (s) => s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

async function debug() {
    try {
        console.log('--- DEBUG SLUG ---');

        // 1. Check what is in DB for anything resembling "Corte"
        const matches = await prisma.barbershop.findMany({
            where: { name: { contains: 'Corte', mode: 'insensitive' } },
            select: { id: true, name: true, slug: true }
        });

        console.log('DB Matches for "Corte":', matches);

        // 2. Test Sanitization logic
        const testInput = "corte-conexão-escola";
        const sanitized = sanitizeSlug(testInput);
        console.log(`Input: "${testInput}" -> Sanitized: "${sanitized}"`);

        // 3. Simulate DB lookup with sanitized version
        const found = await prisma.barbershop.findUnique({
            where: { slug: sanitized }
        });

        console.log('Direct Lookup result:', found ? 'FOUND' : 'NOT FOUND');

    } catch (e) {
        console.error('Debug failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

debug();
