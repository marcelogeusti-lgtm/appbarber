const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRemaining() {
    const emails = [
        'test_multi_role_1772065291398@example.com',
        'test_multi_role_1772066694443@example.com',
        'test_multi_role_1772066732953@example.com',
        'cgeusti@gmail.com',
        'jgeusti@gmail.com',
        'danielnevves28@gmail.com'
    ];

    console.log('--- CHECKING REMAINING USERS ---');
    const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        include: { authUser: true }
    });

    users.forEach(u => {
        console.log(`USER: ${u.name} (${u.email})`);
        console.log(`  ID: ${u.id}`);
        console.log(`  AuthUser ID: ${u.authUserId}`);
        console.log('---');
    });
}

checkRemaining().finally(() => prisma.$disconnect());
