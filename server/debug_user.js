const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugUser() {
    try {
        const email = 'marcelogeusti@gmail.com';
        console.log(`Searching for user: ${email}`);

        const authUser = await prisma.authUser.findUnique({
            where: { email },
            include: {
                user: {
                    include: {
                        ownedBarbershops: true,
                        workedBarbershop: true
                    }
                }
            }
        });

        if (!authUser) {
            console.error('AuthUser not found');
            return;
        }

        console.log('--- AUTH USER ---');
        console.log('ID:', authUser.id);
        console.log('Email:', authUser.email);

        if (!authUser.user) {
            console.error('Pro User profile not found');
            return;
        }

        console.log('\n--- PRO USER ---');
        console.log('ID:', authUser.user.id);
        console.log('Role:', authUser.user.role);
        console.log('WorkedBarbershopId:', authUser.user.workedBarbershopId);
        
        console.log('\n--- OWNED BARBERSHOPS ---');
        authUser.user.ownedBarbershops.forEach(shop => {
            console.log(`- ID: ${shop.id} | Name: ${shop.name} | Slug: ${shop.slug} | Status: ${shop.subscriptionStatus}`);
        });

        if (authUser.user.workedBarbershop) {
            console.log('\n--- WORKED BARBERSHOP ---');
            console.log(`- ID: ${authUser.user.workedBarbershop.id} | Name: ${authUser.user.workedBarbershop.name} | Slug: ${authUser.user.workedBarbershop.slug}`);
        }

    } catch (err) {
        console.error('Error debugging user:', err);
    } finally {
        await prisma.$disconnect();
    }
}

debugUser();
