require('dotenv').config();
const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const PORT = process.env.PORT || 3001;
const prisma = new PrismaClient();

async function main() {
  try {
    // Connect to database
    await prisma.$connect();
    console.log('✅ Connected to Database (PostgreSQL)');

    const http = require('http');
    const server = http.createServer(app);
    const socket = require('./socket');
    const { initReminderScheduler } = require('./scheduler');

    // Init Socket
    socket.init(server);

    // Init Automated Reminders
    initReminderScheduler();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

main();
