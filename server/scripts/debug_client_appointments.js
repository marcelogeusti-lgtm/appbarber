const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const clientsWithAppointments = await prisma.client.findMany({
        where: { appointments: { some: {} } },
        include: {
            appointments: true,
            authUser: true
        }
    });

    for (const client of clientsWithAppointments) {
        console.log(`\n=== Client: ${client.name} ===`);
        console.log(`ID: ${client.id}`);
        console.log(`Phone: ${client.phone}`);
        console.log(`AuthEmail: ${client.authUser?.email}`);
        console.log(`AuthUserId: ${client.authUserId}`);
        console.log(`Appointments Count: ${client.appointments.length}`);

        // Print the first appointment ID
        if (client.appointments.length > 0) {
            console.log(`First Appt ID: ${client.appointments[0].id}`);
            console.log(`Appt Status: ${client.appointments[0].status}`);
            console.log(`Appt Date: ${client.appointments[0].date}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
