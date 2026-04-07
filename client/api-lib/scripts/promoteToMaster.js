/**
 * Script para promover usuário a SUPER_ADMIN (Master)
 * Uso: node src/scripts/promoteToMaster.js <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_EMAIL = process.argv[2] || 'marcelogeusti@gmail.com';

async function main() {
    console.log(`👑 PROMOVENDO USUÁRIO A MASTER (SUPER_ADMIN): ${TARGET_EMAIL}`);

    // 1. Encontrar User pelo Email (campos legacy ou via AuthUser)
    // O sistema usa AuthUser para login, mas Permissions ficam no User (Role).
    // User tem 'email' (legacy) e link 'authUserId'.

    // Tenta achar pelo User.email
    let user = await prisma.user.findFirst({
        where: { email: TARGET_EMAIL }
    });

    // Se não achar, tenta via AuthUser
    if (!user) {
        console.log('🔍 Não encontrado na tabela User diretamente (legacy). Buscando via AuthUser...');
        const authUser = await prisma.authUser.findUnique({
            where: { email: TARGET_EMAIL },
            include: { user: true }
        });

        if (authUser && authUser.user) {
            user = authUser.user;
        } else if (authUser && !authUser.user) {
            console.error('❌ AuthUser encontrado, mas não tem User vinculado. Algo está errado.');
            process.exit(1);
        }
    }

    if (!user) {
        console.error('❌ USUÁRIO NÃO ENCONTRADO EM NENHUMA TABELA.');
        process.exit(1);
    }

    console.log(`✅ Usuário encontrado: ${user.name} (ID: ${user.id}) - Cargo Atual: ${user.role}`);

    // 2. Atualizar Role
    const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' }
    });

    console.log(`🎉 SUCESSO! Usuário agora é SUPER_ADMIN.`);
    console.log(`Dados atualizados: Role=${updated.role}, Active=${updated.active}`);
}

main()
    .catch((e) => {
        console.error('Erro:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
