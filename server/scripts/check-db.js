const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        console.log('Checking database connection...');
        const userCount = await prisma.authUser.count();
        console.log('Database connection successful!');
        console.log('Total AuthUsers:', userCount);
        process.exit(0);
    } catch (error) {
        console.error('Database connection failed or table missing:');
        console.error(error.message);
        process.exit(1);
    }
}

checkDb();
