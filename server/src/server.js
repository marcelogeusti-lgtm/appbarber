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

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

main();
