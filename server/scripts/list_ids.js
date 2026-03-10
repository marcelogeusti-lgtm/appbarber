const prisma = require('../src/lib/prisma');
async function find() {
    const b = await prisma.barbershop.findFirst();
    const u = await prisma.user.findFirst({ where: { role: 'BARBER' } });
    const c = await prisma.client.findFirst();
    const s = await prisma.service.findFirst();
    console.log(JSON.stringify({
        barbershop: b ? b.id : null,
        barber: u ? u.id : null,
        client: c ? c.id : null,
        service: s ? s.id : null
    }, null, 2));
}
find().catch(console.error).finally(() => prisma.$disconnect());
