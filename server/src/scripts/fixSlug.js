const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    try {
        const id = '8b3fcfd4-309c-4e24-9004-e03492986be4';
        const newSlug = 'corte-conexao-escola';

        console.log(`Fixing slug for ID ${id} to "${newSlug}"...`);

        await prisma.barbershop.update({
            where: { id },
            data: { slug: newSlug }
        });

        console.log('SUCCESS: Slug updated.');
    } catch (e) {
        console.error('Fix failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
