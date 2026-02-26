
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting connection...');
        await prisma.$connect();
        console.log('Connection SUCCESS!');
    } catch (e) {
        console.error('Connection FAILED:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
