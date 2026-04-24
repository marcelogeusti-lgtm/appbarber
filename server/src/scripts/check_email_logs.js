
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmailLogs() {
  console.log('--- EMAIL LOGS CHECK ---');
  const logs = await prisma.emailLog.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Last 10 email logs:');
  console.log(JSON.stringify(logs, null, 2));

  const total = await prisma.emailLog.count();
  console.log('Total email logs:', total);

  process.exit(0);
}

checkEmailLogs();
