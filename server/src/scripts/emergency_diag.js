const prisma = require('../lib/prisma');

async function run() {
    try {
        const users = await prisma.user.findMany({
            where: { name: 'Marcelo Geusti' },
            select: { id: true, email: true, role: true, authUserId: true }
        });
        console.log('--- ALL MARCELO GEUSTI USERS ---');
        console.log(JSON.stringify(users, null, 2));

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
run();
