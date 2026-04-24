const prisma = require('../lib/prisma');

async function test() {
    const clients = await prisma.client.findMany({ take: 1 });
    if (!clients.length) return console.log("No clients found");
    const client = clients[0];

    const apps = await prisma.appointment.findMany({
        where: { clientId: client.id }
    });
    console.log("Client appointments total:", apps.length);

    const unreviewed = await prisma.appointment.findMany({
        where: {
            clientId: client.id,
            status: 'COMPLETED',
            review: null
        }
    });
    console.log("Unreviewed COMPLETED appointments:", unreviewed.length);

    // Let's create an appointment for test and mark it completed
    const shop = await prisma.barbershop.findFirst();
    const service = await prisma.service.findFirst();
    const pro = await prisma.professional.findFirst();

    if(shop && service && pro) {
        const testApp = await prisma.appointment.create({
            data: {
                date: new Date(),
                time: "10:00",
                status: "COMPLETED",
                clientId: client.id,
                barbershopId: shop.id,
                serviceId: service.id,
                professionalId: pro.id,
                price: 50
            }
        });
        console.log("Created test COMPLETED appointment:", testApp.id);
        
        const unreviewedNow = await prisma.appointment.findMany({
            where: {
                clientId: client.id,
                status: 'COMPLETED',
                review: null
            }
        });
        console.log("Unreviewed NOW:", unreviewedNow.length);
        
        // Try creating review
        const review = await prisma.review.create({
            data: {
                rating: 5,
                comment: "Great!",
                appointmentId: testApp.id,
                clientId: client.id,
                barbershopId: shop.id
            }
        });
        console.log("Review created:", review.id);
    }
}
test().catch(console.error).finally(() => prisma.$disconnect());
