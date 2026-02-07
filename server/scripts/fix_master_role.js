const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'marcelogeusti@gmail.com';
    console.log(`Checking user: ${email}`);

    const authUser = await prisma.authUser.findUnique({
        where: { email },
        include: { user: true }
    });

    if (!authUser) {
        console.log('AuthUser not found.');
        return;
    }

    console.log('AuthUser found:', authUser.id);

    if (!authUser.user) {
        console.log('Linked User profile not found.');
        return;
    }

    console.log('Current Role:', authUser.user.role);

    if (authUser.user.role !== 'SUPER_ADMIN') {
        console.log('Updating role to SUPER_ADMIN...');
        await prisma.user.update({
            where: { id: authUser.user.id },
            data: { role: 'SUPER_ADMIN' }
        });
        console.log('Role updated successfully.');
    } else {
        console.log('User is already SUPER_ADMIN.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
