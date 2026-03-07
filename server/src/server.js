process.env.TZ = "America/Sao_Paulo";
require('dotenv').config();
const app = require('./app');
const prisma = require('./lib/prisma');

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    // Connect to database with retry
    let retries = 5;
    while (retries > 0) {
      try {
        await prisma.$connect();
        console.log('✅ Connected to Database (PostgreSQL)');
        break;
      } catch (error) {
        retries -= 1;
        console.error(`❌ Database connection failed. Retries left: ${retries}`, error.message);
        if (retries === 0) throw error;
        await new Promise(res => setTimeout(res, 3000));
      }
    }

    const http = require('http');
    const server = http.createServer(app);
    const socket = require('./socket');
    const { initScheduler } = require('./services/jobs/reminderJob');

    // Init Socket
    socket.init(server);

    // Init Automated Reminders
    initScheduler();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Fatal: Database connection failed after retries:', error);
    process.exit(1);
  }
}

main();