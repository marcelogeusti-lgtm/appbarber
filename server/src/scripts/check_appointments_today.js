
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAppointments() {
  console.log('--- APPOINTMENTS CHECK FOR TODAY ---');
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const appointments = await prisma.appointment.findMany({
    where: {
      createdAt: { gte: today }
    },
    include: {
      client: true,
      service: true,
      professional: true
    }
  });
  
  console.log(`Found ${appointments.length} appointments created today.`);
  console.log(JSON.stringify(appointments, null, 2));

  process.exit(0);
}

checkAppointments();
