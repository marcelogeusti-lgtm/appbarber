const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLog() {
    const lastLogs = await prisma.emailLog.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });
    console.log('Last 5 Email Logs:');
    lastLogs.forEach(log => {
        console.log(`- To: ${log.email}, Subject: ${log.subject}, Status: ${log.status}, CreatedAt: ${log.createdAt}`);
    });
}
checkLog().finally(() => prisma.$disconnect());
