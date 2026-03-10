const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listModels() {
    const keys = Object.keys(prisma).filter(key =>
        !key.startsWith('_') &&
        !key.startsWith('$') &&
        typeof prisma[key] === 'object'
    );
    console.log('Available Prisma Models:');
    console.log(JSON.stringify(keys, null, 2));
    await prisma.$disconnect();
}

listModels();
