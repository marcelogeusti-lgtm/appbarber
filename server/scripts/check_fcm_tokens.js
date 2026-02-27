const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTokens() {
    try {
        const tokens = await prisma.fcmToken.findMany({
            include: {
                authUser: {
                    select: { email: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('--- Registered FCM Tokens ---');
        if (tokens.length === 0) {
            console.log('No tokens found yet. Waiting for a device to register.');
        } else {
            console.log(`Found ${tokens.length} tokens:`);
            tokens.forEach(t => {
                console.log(`- Token: ${t.token.substring(0, 20)}... (User: ${t.authUser?.email || 'Unknown'}) - Created: ${t.createdAt}`);
            });
        }
    } catch (error) {
        console.error('Error checking tokens:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTokens();
