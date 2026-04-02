const prisma = require('./src/lib/prisma');

async function findMarcelo() {
    const user = await prisma.user.findFirst({
        where: { email: 'marcelogeusti@gmail.com' },
        include: { 
            barbershops: {
                include: { gatewayConfigs: true }
            },
            authUser: true 
        }
    });
    console.log(JSON.stringify(user, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}

findMarcelo().catch(console.error).finally(() => prisma.$disconnect());
