const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    try {
        console.log('--- DIAGNOSTICS ---');
        
        const masterUser = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' }
        });
        console.log('Master User:', masterUser ? { id: masterUser.id, name: masterUser.name, email: masterUser.email } : 'Not found');

        const shops = await prisma.barbershop.findMany({
            include: {
                _count: {
                    select: {
                        services: true,
                        products: true,
                        appointments: true,
                        staff: true,
                        transactions: true
                    }
                }
            }
        });
        console.log('Shops:', JSON.stringify(shops, null, 2));

        const recoveredProfessionals = await prisma.professional.findMany({
            where: {
                OR: [
                    { bio: { contains: 'recuperado', mode: 'insensitive' } },
                    { position: { contains: 'recuperado', mode: 'insensitive' } },
                    { user: { name: { contains: 'recuperado', mode: 'insensitive' } } }
                ]
            },
            include: { user: true }
        });
        console.log('Recovered Professionals count:', recoveredProfessionals.length);
        console.log('Recovered Professionals names:', recoveredProfessionals.map(p => p.user.name));

        const recoveredServices = await prisma.service.findMany({
            where: {
                name: { contains: 'recuperado', mode: 'insensitive' }
            }
        });
        console.log('Recovered Services count:', recoveredServices.length);
        console.log('Recovered Services names:', recoveredServices.map(s => s.name));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
