const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findSlug() {
    const barbershop = await prisma.barbershop.findUnique({
        where: { id: '94dad01c-504e-4f93-bcfe-5371d5a7ee50' },
        select: { slug: true, name: true }
    });
    console.log('BARBERSHOP_INFO:', JSON.stringify(barbershop));
    await prisma.$disconnect();
}

findSlug();
