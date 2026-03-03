const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const clients = await prisma.client.findMany({
        where: { authUser: { isNot: null } },
        include: {
            authUser: true,
            appointments: true
        }
    });

    for (const client of clients) {
        console.log(`Client: ${client.name} | Phone: ${client.phone} | AuthEmail: ${client.authUser?.email} | AuthUserId: ${client.authUserId} | Appointments: ${client.appointments.length}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
