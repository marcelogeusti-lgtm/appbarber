const prisma = require('./src/lib/prisma');
async function run() {
    try {
        const configs = await prisma.gatewayConfig.findMany();
        console.log(JSON.stringify(configs, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
