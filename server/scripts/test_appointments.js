const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const email = 'marcelogeusti@gmail.com';
    const authUser = await prisma.authUser.findUnique({
        where: { email },
        include: {
            client: {
                include: {
                    appointments: true
                }
            }
        }
    });

    if (!authUser) {
        console.log('User not found');
        return;
    }

    console.log(`Found AuthUser: ${authUser.id}`);
    if (!authUser.client) {
        console.log('No client linked to this AuthUser');
        return;
    }

    const client = authUser.client;
    console.log(`Client ID: ${client.id}, Appointments: ${client.appointments.length}`);
    if(client.appointments.length > 0) {
        console.log(client.appointments.map(a => `${a.id} - ${a.date} - ${a.status}`));
    }
}
run().catch(console.error).finally(() => prisma.$disconnect());
