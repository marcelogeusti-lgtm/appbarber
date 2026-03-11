const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const hash = await bcrypt.hash('123456', 10);
    await prisma.authUser.update({
        where: { email: 'demo@corteconexao.com.br' },
        data: { password: hash }
    });
    console.log('Password updated successfully');
    prisma.$disconnect();
}
run();
