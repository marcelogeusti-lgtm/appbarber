const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
    try {
        console.log('--- Auth & Client Diagnosis ---');
        
        // 1. Check AuthUsers
        const authUsersCount = await prisma.authUser.count();
        console.log('Total AuthUsers:', authUsersCount);
        
        // 2. Check Clients without AuthUserId
        const clientsWithoutAuth = await prisma.client.count({
            where: { authUserId: null }
        });
        console.log('Clients without AuthUserId:', clientsWithoutAuth);
        
        // 3. Check Users (Pros) without AuthUserId
        const prosWithoutAuth = await prisma.user.count({
            where: { authUserId: null }
        });
        console.log('Pros without AuthUserId:', prosWithoutAuth);
        
        // 4. Sample some users
        const sampleAuth = await prisma.authUser.findMany({
            take: 5,
            include: { client: true, user: true }
        });
        console.log('Sample Auth Mapping:');
        sampleAuth.forEach(a => {
            console.log(` - Email: ${a.email} | Provider: ${a.provider} | HasClient: ${!!a.client} | HasUser: ${!!a.user}`);
        });

        // 5. Check for duplicate emails/phones if any
        // (Prisma unique constraints usually prevent this, but let's see)

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();
