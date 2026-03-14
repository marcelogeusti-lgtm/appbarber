const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const ownerId = '33cd14a7-5d0b-4c91-8071-f7d18d49a096';
        const user = await prisma.user.findUnique({
            where: { id: ownerId },
            include: { professionalProfile: true }
        });
        console.log('--- OWNER DATA ---');
        console.log(JSON.stringify(user, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
