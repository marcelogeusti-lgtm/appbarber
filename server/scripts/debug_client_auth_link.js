const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const clients = await prisma.client.findMany({
        where: { authUser: { isNot: null } },
        include: { authUser: true }
    });

    console.log("Clients with AuthUser:");
    for (const c of clients) {
        console.log(`- ${c.name} (${c.id})`);
    }

    const unlinked = await prisma.client.findMany({
        where: { authUser: null }
    });

    console.log("\nClients without AuthUser:");
    for (const c of unlinked) {
        console.log(`- ${c.name} (${c.id})`);
    }

    const appointments = await prisma.appointment.findMany({
        include: {
            client: true
        }
    });

    console.log("\nAppointments:");
    for (const a of appointments) {
        console.log(`- ID: ${a.id} | Client: ${a.client.name} (${a.clientId}) | ClientHasAuth: ${!!a.client.authUserId}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
