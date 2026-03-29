const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfigs() {
  try {
    const configs = await prisma.gatewayConfig.findMany({
      include: { barbershop: true }
    });
    console.log(`Found ${configs.length} gateway configs.`);
    configs.forEach(c => {
      console.log(`- Shop: ${c.barbershop?.name || c.barbershopId}, Gateway: ${c.gateway}, Has Credentials: ${!!c.credentials}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfigs();
