const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.barbershop.count();
        console.log(`SHOP COUNT: ${count}`);
        
        if (count > 0) {
            const shops = await prisma.barbershop.findMany({ 
                select: { id: true, name: true, slug: true, address: true, latitude: true, longitude: true, subscriptionStatus: true } 
            });
            shops.forEach(s => {
                console.log(`ID: ${s.id} | NAME: ${s.name} | SLUG: ${s.slug} | ADDR: ${s.address} | LAT: ${s.latitude} | LNG: ${s.longitude} | STATUS: ${s.subscriptionStatus}`);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
