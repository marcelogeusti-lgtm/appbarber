const prisma = require('./src/lib/prisma');

async function findMarcelo() {
    try {
        console.log('Searching for AuthUser...');
        const authUser = await prisma.authUser.findUnique({
            where: { email: 'marcelogeusti@gmail.com' },
            include: { 
                user: {
                    include: {
                        ownedBarbershops: {
                            include: { gatewayConfigs: true }
                        }
                    }
                }
            }
        });
        
        if (!authUser) {
            console.log('No AuthUser found with that email.');
            // Try searching in User model directly (legacy)
            const legacyUser = await prisma.user.findFirst({
                where: { email: 'marcelogeusti@gmail.com' }
            });
            console.log('Legacy User search result:', legacyUser ? 'Found' : 'Not Found');
            if (legacyUser) console.log(JSON.stringify(legacyUser, null, 2));
            return;
        }

        console.log('AuthUser found!');
        console.log(JSON.stringify(authUser, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
    } catch (e) {
        console.error('Error detail:', e);
    }
}

findMarcelo().finally(() => prisma.$disconnect());
