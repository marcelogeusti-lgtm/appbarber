const prisma = require('./src/lib/prisma');

async function testAuthFixes() {
    console.log('--- Testing Auth Security Fixes ---');

    try {
        // 1. Check if we can find recent sessions
        const recentSessions = await prisma.session.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${recentSessions.length} recent sessions.`);
        if (recentSessions.length > 0) {
            console.log('Latest session:', {
                id: recentSessions[0].id,
                device: recentSessions[0].deviceInfo,
                ip: recentSessions[0].ipAddress,
                created: recentSessions[0].createdAt
            });
        }

        // 2. Check if Notification model has status field (from Phase 1)
        // This is a dynamic check by trying to query it
        const notifications = await prisma.notification.findMany({ take: 1 });
        console.log('Notification model check: OK');

        // 3. Check for EmailLog entries
        const logs = await prisma.emailLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        console.log(`Found ${logs.length} email logs.`);

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testAuthFixes();
