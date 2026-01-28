const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- RESTAURAÇÃO CRÍTICA DE DADOS: MARCELO ---');

    const email = 'marcelogeusti@gmail.com';

    // 1. Buscar o usuário Marcelo
    const user = await prisma.user.findFirst({
        where: { email: email }
    });

    if (!user) {
        console.error(`❌ Usuário ${email} não encontrado!`);
        return;
    }

    console.log(`✅ Usuário encontrado: ${user.name} (${user.id})`);

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 2. Buscar ou criar a barbearia principal
            let shop = await tx.barbershop.findFirst({
                where: { OR: [{ ownerId: user.id }, { slug: 'barbearia-master' }, { slug: 'corte-conexao' }] }
            });

            if (!shop) {
                console.log('Criando nova barbearia para Marcelo...');
                shop = await tx.barbershop.create({
                    data: {
                        name: 'Corte Conexão',
                        slug: 'corte-conexao',
                        address: 'Rua Principal, 123',
                        phone: user.phone || '21991164174',
                        ownerId: user.id,
                        staff: { connect: { id: user.id } }
                    }
                });
            } else {
                console.log(`✅ Barbearia encontrada: ${shop.name} (${shop.id})`);
                // Garantir que Marcelo é o dono e staff
                await tx.barbershop.update({
                    where: { id: shop.id },
                    data: {
                        ownerId: user.id,
                        staff: { connect: { id: user.id } }
                    }
                });
            }

            // 3. Atualizar o usuário
            await tx.user.update({
                where: { id: user.id },
                data: {
                    role: 'SUPER_ADMIN',
                    workedBarbershopId: shop.id,
                    active: true
                }
            });

            // 4. Perfil Profissional
            await tx.professional.upsert({
                where: { userId: user.id },
                update: {
                    position: 'Proprietário / Profissional',
                    showInApp: true,
                    showPublicly: true
                },
                create: {
                    userId: user.id,
                    position: 'Proprietário / Profissional',
                    showInApp: true,
                    showPublicly: true
                }
            });

            return shop;
        });

        console.log(`\n🎉 RECUPERAÇÃO CONCLUÍDA PARA MARCELO!`);
        console.log(`Barbearia: ${result.name}`);
        console.log(`ID: ${result.id}`);
        console.log(`Owner: ${user.name}`);
        console.log('\nPor favor, faça LOGIN novamente em corteconexao.com.br para atualizar sua sessão.');

    } catch (error) {
        console.error('❌ Falha na recuperação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
