const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restore() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'marcelogeusti@gmail.com' }
        });

        if (!user) {
            console.log('Master user not found');
            return;
        }

        const existingPro = await prisma.professional.findUnique({
            where: { userId: user.id }
        });

        if (existingPro) {
            console.log('Professional profile already exists');
        } else {
            await prisma.professional.create({
                data: {
                    userId: user.id,
                    position: 'Proprietário / Master',
                    bio: 'Administrador do Sistema',
                    showInApp: true,
                    showPublicly: true
                }
            });
            console.log('Professional profile restored for Master User');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

restore();
