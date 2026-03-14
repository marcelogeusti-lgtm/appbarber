const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const shop = await prisma.barbershop.findFirst({
            where: { name: { contains: 'Waniely', mode: 'insensitive' } }
        });
        if (!shop) {
            console.log('Shop not found');
            return;
        }
        console.log('ID:', shop.id);
        console.log('Name:', shop.name);
        console.log('Commercial Name:', shop.commercialName);
        console.log('Legal Name:', shop.legalName);
        console.log('Logo Length:', shop.logoUrl ? shop.logoUrl.length : 0);
        console.log('Logo Start:', shop.logoUrl ? shop.logoUrl.substring(0, 50) : 'none');
        console.log('Banners Count:', shop.bannerUrls ? shop.bannerUrls.length : 0);
        if (shop.bannerUrls) {
            shop.bannerUrls.forEach((b, i) => {
                console.log(`Banner ${i} Length:`, b.length);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
