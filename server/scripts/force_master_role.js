const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUser(email) {
    try {
        console.log(`Searching for user: ${email}`);
        const u = await prisma.user.findFirst({
            where: { email }
        });

        if (!u) {
            console.log('User not found.');
            return;
        }

        console.log(`Current role: ${u.role}`);

        await prisma.user.update({
            where: { id: u.id },
            data: { role: 'SUPER_ADMIN' }
        });

        console.log(`Updated role to SUPER_ADMIN for ${email}`);
    } catch (err) {
        console.error('Error fixing user:', err);
    } finally {
        await prisma.$disconnect();
    }
}

fixUser('marcelogeusti@gmail.com');
