
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNotifications() {
  console.log('--- NOTIFICATIONS CHECK ---');
  const lastNotifications = await prisma.notification.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } }
  });
  
  console.log('Last 5 notifications:');
  console.log(JSON.stringify(lastNotifications, null, 2));

  const total = await prisma.notification.count();
  console.log('Total notifications:', total);

  const lastLogs = await prisma.emailLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  console.log('Last 5 email logs:');
  console.log(JSON.stringify(lastLogs, null, 2));

  process.exit(0);
}

checkNotifications();
