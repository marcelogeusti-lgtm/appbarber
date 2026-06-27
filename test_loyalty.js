const prisma = require('./server/src/lib/prisma');

async function run() {
  const barbershop = await prisma.barbershop.findFirst();
  if (!barbershop) return console.log('No barbershop');
  
  console.log("Barbershop:", barbershop.id);
  
  // mock the controller
  try {
    const active = true;
    const pointsPerReal = 1.5;
    const rewardDescription = 'Free haircut';
    const minPointsToRedeem = 100;
    
    const settings = await prisma.loyaltyProgram.upsert({
        where: { barbershopId: barbershop.id },
        update: {
            active: Boolean(active),
            pointsPerReal: pointsPerReal,
            rewardDescription: rewardDescription || '',
            minPointsToRedeem: minPointsToRedeem
        },
        create: {
            barbershopId: barbershop.id,
            active: Boolean(active),
            pointsPerReal: pointsPerReal,
            rewardDescription: rewardDescription || '',
            minPointsToRedeem: minPointsToRedeem
        }
    });
    console.log("Success:", settings);
  } catch (err) {
    console.error("Prisma error:", err);
  }
}
run();
