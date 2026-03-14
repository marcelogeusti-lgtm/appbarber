const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

const MASTER_USER_ID = 'ff550352-540a-4fd4-a1a5-55cb7c61a54f';

async function main() {
    console.log('--- STARTING ROBUST DATABASE RECONSTRUCTION ---');
    
    const manifest = JSON.parse(fs.readFileSync('reconstruction_manifest.json', 'utf8'));
    console.log(`Manifest loaded: ${manifest.barbershops.length} shops, ${manifest.professionals.length} pros, ${manifest.appointments.length} apps.`);

    // 0. Ensure a Generic Client exists for fallbacks
    const fallbackClient = await prisma.client.upsert({
        where: { id: 'fallback-client-id' },
        update: {},
        create: {
            id: 'fallback-client-id',
            name: 'Cliente Recuperado',
            phone: '0000000000'
        }
    });

    // 1. Restore Barbershops
    for (const shop of manifest.barbershops) {
        if (!shop.id) continue;
        console.log(`Restoring Barbershop: ${shop.name || shop.id}`);
        await prisma.barbershop.upsert({
            where: { id: shop.id },
            update: {},
            create: {
                id: shop.id,
                name: shop.name || 'Barbearia Recuperada',
                slug: shop.slug || `shop-${shop.id.substring(0, 8)}`,
                address: shop.address || 'Endereço pendente',
                phone: shop.phone || '0000000000',
                ownerId: MASTER_USER_ID,
                logoUrl: shop.logoUrl || null
            }
        });

        // Ensure a dummy service exists for this shop
        await prisma.service.upsert({
            where: { id: `service-fallback-${shop.id}` },
            update: {},
            create: {
                id: `service-fallback-${shop.id}`,
                name: 'Serviço Recuperado',
                price: 0,
                duration: 30,
                barbershopId: shop.id
            }
        });
    }

    // 2. Restore Professionals
    for (const pro of manifest.professionals) {
        if (!pro.id) continue;
        console.log(`Restoring Professional: ${pro.name || pro.id}`);
        
        let targetUserId = pro.userId;
        
        // If pro has no user, we might need to create a dummy user to satisfy constraint
        if (!targetUserId) {
            targetUserId = `user-pro-${pro.id}`;
            await prisma.user.upsert({
                where: { id: targetUserId },
                update: {},
                create: {
                    id: targetUserId,
                    name: pro.name || 'Profissional Recuperado',
                    email: `recuperado-${pro.id.substring(0, 8)}@example.com`,
                    role: 'BARBER'
                }
            });
        } else {
            // Ensure target user exists
            const existingUser = await prisma.user.findUnique({ where: { id: targetUserId } });
            if (!existingUser) {
                 await prisma.user.create({
                    data: {
                        id: targetUserId,
                        name: pro.name || 'User Recuperado',
                        email: `user-rec-${pro.id.substring(0, 8)}@example.com`,
                        role: 'BARBER'
                    }
                 });
            }
        }

        const shopId = pro.barbershopId || manifest.barbershops[0]?.id;

        await prisma.professional.upsert({
            where: { id: pro.id },
            update: {},
            create: {
                id: pro.id,
                userId: targetUserId,
                bio: pro.bio || '',
                position: pro.position || 'Barbeiro'
            }
        });
        
        // Ensure pro is staff of the shop
        if (shopId) {
            await prisma.user.update({
                where: { id: targetUserId },
                data: { workedBarbershopId: shopId }
            });
        }
    }

    // 3. Restore Appointments
    let restoredAppts = 0;
    for (const appt of manifest.appointments) {
        if (!appt.id) continue;
        
        const shopId = appt.barbershopId || appt.barbershop?.id || manifest.barbershops[0]?.id;
        const proId = appt.professionalId || appt.professional?.id || manifest.professionals[0]?.id;
        const serviceId = appt.serviceId || appt.service?.id || `service-fallback-${shopId}`;

        if (!shopId || !proId) continue;

        try {
            // Ensure pro is a USER with BARBER role for relation "ProAppointments"
            // Wait, Professional model has its own ID, but Appointment.professionalId maps to User.id?
            // Let's re-verify schema.
            // line 498: professionalId String, professional User @relation("ProAppointments", fields: [professionalId], references: [id])
            // YES. professionalId in Appointment is a USER ID.
            
            // Get the User ID for this Professional
            const professionalRecord = await prisma.professional.findUnique({ where: { id: proId } });
            const finalProId = professionalRecord ? professionalRecord.userId : MASTER_USER_ID;

            await prisma.appointment.upsert({
                where: { id: appt.id },
                update: {},
                create: {
                    id: appt.id,
                    date: appt.date ? new Date(appt.date) : new Date(),
                    status: (appt.status && ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appt.status)) ? appt.status : 'CONFIRMED',
                    clientId: fallbackClient.id,
                    barbershopId: shopId,
                    professionalId: finalProId,
                    serviceId: serviceId
                }
            });
            restoredAppts++;
        } catch (e) {
            console.error(`Failed to restore Appointment ${appt.id}:`, e.message);
        }
    }

    console.log(`--- ROBUST RECONSTRUCTION COMPLETE ---`);
    console.log(`Restored Appointments: ${restoredAppts}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
