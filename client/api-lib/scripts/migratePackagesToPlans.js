/**
 * Migra "Pacotes de Serviços" (BarbershopPackage / ClientPackage) para
 * "Planos & Assinaturas" (SubscriptionPlan com isRecurring=false / ClientSubscription).
 *
 * Uso (a partir de client/):
 *   node api-lib/scripts/migratePackagesToPlans.js            -> dry-run (padrão, não grava nada)
 *   node api-lib/scripts/migratePackagesToPlans.js --apply    -> grava no banco
 *
 * Idempotente:
 *   - Plano migrado é marcado na descrição com "[migrado de pacote <packageId>]".
 *   - Assinatura migrada é marcada em externalId com "migrated-package:<clientPackageId>".
 * Não apaga nenhuma linha das tabelas antigas.
 */
const prisma = require('../lib/prisma');

const APPLY = process.argv.includes('--apply');
const PLAN_MARKER = (pkgId) => `[migrado de pacote ${pkgId}]`;
const SUB_MARKER = (cpId) => `migrated-package:${cpId}`;

// ClientPackage.status: ACTIVE | USED | EXPIRED (string livre)
// SubscriptionStatus: PENDING | ACTIVE | OVERDUE | CANCELLED | INACTIVE
function mapStatus(cp, now) {
    const status = String(cp.status || '').toUpperCase();
    if (status === 'ACTIVE' && cp.endDate > now && cp.remainingQuantity > 0) return 'ACTIVE';
    if (status === 'CANCELED' || status === 'CANCELLED') return 'CANCELLED';
    return 'INACTIVE'; // USED, EXPIRED, ou ACTIVE já vencido/sem saldo
}

async function findMigratedPlan(pkg) {
    return prisma.subscriptionPlan.findFirst({
        where: {
            barbershopId: pkg.barbershopId,
            name: pkg.name,
            isRecurring: false,
            description: { contains: PLAN_MARKER(pkg.id) },
        },
    });
}

async function main() {
    const now = new Date();
    const summary = {
        packages: 0, plansCreated: 0, plansSkipped: 0,
        clientPackages: 0, subsCreated: 0, subsSkipped: 0, subsMissingClient: 0, subsMissingPlan: 0,
        byStatus: {},
    };

    console.log(`\n=== Migração Pacotes -> Planos (${APPLY ? 'APPLY' : 'DRY-RUN'}) ===\n`);

    const packages = await prisma.barbershopPackage.findMany({
        include: { services: { select: { id: true } } },
        orderBy: { createdAt: 'asc' },
    });
    summary.packages = packages.length;

    // packageId -> planId (null em dry-run para planos ainda não criados)
    const planByPackage = new Map();

    for (const pkg of packages) {
        const existing = await findMigratedPlan(pkg);
        if (existing) {
            summary.plansSkipped++;
            planByPackage.set(pkg.id, existing.id);
            console.log(`[skip] Pacote "${pkg.name}" (${pkg.id}) já migrado -> plano ${existing.id}`);
            continue;
        }

        const marker = PLAN_MARKER(pkg.id);
        const data = {
            name: pkg.name,
            description: pkg.description ? `${pkg.description}\n${marker}` : marker,
            benefits: [],
            price: Number(pkg.price) || 0,
            validityDays: pkg.validityDays || 90,
            quantityOfCuts: pkg.totalQuantity || 0,
            isRecurring: false,
            active: pkg.active,
            barbershopId: pkg.barbershopId,
            services: { connect: pkg.services.map((s) => ({ id: s.id })) },
        };

        if (APPLY) {
            const plan = await prisma.subscriptionPlan.create({ data });
            planByPackage.set(pkg.id, plan.id);
            console.log(`[create] Plano ${plan.id} <- pacote "${pkg.name}" (${pkg.id}), ${pkg.services.length} serviço(s)`);
        } else {
            planByPackage.set(pkg.id, null);
            console.log(`[dry] Criaria plano <- pacote "${pkg.name}" (${pkg.id}), ${data.quantityOfCuts} usos, ${data.validityDays} dias, ${pkg.services.length} serviço(s)`);
        }
        summary.plansCreated++;
    }

    const clientPackages = await prisma.clientPackage.findMany({ orderBy: { createdAt: 'asc' } });
    summary.clientPackages = clientPackages.length;

    for (const cp of clientPackages) {
        const marker = SUB_MARKER(cp.id);
        const existing = await prisma.clientSubscription.findFirst({ where: { externalId: marker } });
        if (existing) {
            summary.subsSkipped++;
            console.log(`[skip] ClientPackage ${cp.id} já migrado -> assinatura ${existing.id}`);
            continue;
        }

        if (!planByPackage.has(cp.packageId)) {
            summary.subsMissingPlan++;
            console.warn(`[warn] ClientPackage ${cp.id}: pacote ${cp.packageId} não encontrado, ignorado`);
            continue;
        }

        // ClientPackage.clientId não tem FK; garante que aponta para um Client real.
        const client = await prisma.client.findUnique({ where: { id: cp.clientId }, select: { id: true } });
        if (!client) {
            summary.subsMissingClient++;
            console.warn(`[warn] ClientPackage ${cp.id}: cliente ${cp.clientId} não existe na tabela Client, ignorado`);
            continue;
        }

        const status = mapStatus(cp, now);
        summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;

        if (APPLY) {
            const sub = await prisma.clientSubscription.create({
                data: {
                    clientId: cp.clientId,
                    planId: planByPackage.get(cp.packageId),
                    status,
                    startDate: cp.startDate,
                    endDate: cp.endDate,
                    nextBillingDate: null,
                    remainingCuts: cp.remainingQuantity,
                    externalId: marker,
                },
            });
            console.log(`[create] Assinatura ${sub.id} (${status}) <- ClientPackage ${cp.id}, saldo ${cp.remainingQuantity}`);
        } else {
            console.log(`[dry] Criaria assinatura (${status}) <- ClientPackage ${cp.id}, cliente ${cp.clientId}, saldo ${cp.remainingQuantity}, até ${cp.endDate.toISOString()}`);
        }
        summary.subsCreated++;
    }

    console.log('\n=== Resumo ===');
    console.log(`Pacotes encontrados:          ${summary.packages}`);
    console.log(`Planos ${APPLY ? 'criados' : 'a criar'}:              ${summary.plansCreated}`);
    console.log(`Planos já migrados (skip):    ${summary.plansSkipped}`);
    console.log(`ClientPackages encontrados:   ${summary.clientPackages}`);
    console.log(`Assinaturas ${APPLY ? 'criadas' : 'a criar'}:         ${summary.subsCreated} ${JSON.stringify(summary.byStatus)}`);
    console.log(`Assinaturas já migradas:      ${summary.subsSkipped}`);
    console.log(`Ignorados (cliente inexist.): ${summary.subsMissingClient}`);
    console.log(`Ignorados (pacote inexist.):  ${summary.subsMissingPlan}`);
    if (!APPLY) console.log('\nDry-run: nada foi gravado. Rode com --apply para migrar.');
    console.log('Nenhuma linha antiga (BarbershopPackage/ClientPackage) foi removida.\n');
}

main()
    .catch((err) => {
        console.error('Erro na migração:', err);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
