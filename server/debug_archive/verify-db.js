require('dotenv').config({ path: './server/.env' });
const { PrismaClient } = require('@prisma/client');

console.log('Testing with POOLED DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
    // No datasources override -> uses schema.prisma logic (env("DATABASE_URL"))
});

async function main() {
    console.log('🔄 Tentando conectar (POOLER)...');
    try {
        const userCount = await prisma.user.count();
        console.log(`✅ Conexão POOLER BEM SUCEDIDA!`);
        console.log(`📊 Usuários: ${userCount}`);
    } catch (error) {
        console.error('❌ ERRO NA CONEXÃO POOLER:');
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
