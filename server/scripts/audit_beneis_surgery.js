const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
    try {
        console.log('--- SURGICAL AUDIT: BENEIS ---');
        
        const shop = await prisma.barbershop.findFirst({
            where: {
                OR: [
                    { name: { contains: 'Beneis', mode: 'insensitive' } },
                    { name: { contains: 'Benites', mode: 'insensitive' } },
                    { slug: { contains: 'benites', mode: 'insensitive' } }
                ]
            },
            include: {
                owner: true,
                gatewayConfigs: true
            }
        });

        if (!shop) {
            console.log('Shop not found');
            return;
        }

        console.log('ID:', shop.id);
        console.log('Name:', shop.name);
        console.log('Slug:', shop.slug);
        console.log('Address:', shop.address);
        console.log('Lat/Lng:', shop.latitude, shop.longitude);
        console.log('Subscription Status:', shop.subscriptionStatus);
        console.log('Logo URL:', shop.logoUrl);
        console.log('Banner URLs:', shop.bannerUrls);
        
        console.log('Owner Name:', shop.owner?.name);
        console.log('Owner Role:', shop.owner?.role);
        
        console.log('Gateway Configs Count:', shop.gatewayConfigs.length);
        shop.gatewayConfigs.forEach(g => {
            console.log(`- ${g.gateway}: ${g.isActive ? 'Active' : 'Inactive'} (Creds keys: ${Object.keys(g.credentials || {}).join(', ')})`);
        });

        // Check for any extra fields using raw query on information_schema or just Select *
        const rawRows = await prisma.$queryRawUnsafe(`SELECT * FROM "Barbershop" WHERE id = '${shop.id}'`);
        if (rawRows.length > 0) {
            console.log('All DB Fields:', Object.keys(rawRows[0]).join(', '));
            console.log('Raw Values of name fields:', {
                name: rawRows[0].name,
                commercial_name: rawRows[0].commercial_name, // Testing if it exists
                legal_name: rawRows[0].legal_name // Testing if it exists
            });
        }

    } catch (e) {
        console.error('Audit Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

audit();
