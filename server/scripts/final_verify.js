const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.count();
        const authUsers = await prisma.authUser.count();
        const shops = await prisma.barbershop.count();
        const appts = await prisma.appointment.count();
        
        console.log('--- FINAL STATE ---');
        console.log('Users (Pro):', users);
        console.log('AuthUsers:', authUsers);
        console.log('Barbershops:', shops);
        console.log('Appointments:', appts);

        const master = await prisma.authUser.findFirst({
            where: { email: 'marcelogeusti@gmail.com' }
        });
        console.log('Master Auth exists:', !!master);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
