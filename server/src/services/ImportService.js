const prisma = require('../lib/prisma');

class ImportService {
    /**
     * Processa a importação de dados em batch
     * @param {string} barbershopId 
     * @param {Array} clients 
     * @param {Array} appointments 
     */
    static async processImport(barbershopId, clients = [], appointments = []) {
        console.log(`[ImportService] Iniciando processo para barbershop ${barbershopId}`);
        console.log(`- Clientes: ${clients.length}`);
        console.log(`- Agendamentos: ${appointments.length}`);

        const response = {
            successCount: { clients: 0, appointments: 0 },
            errors: []
        };

        // 1. Processar Clientes
        const clientCache = {}; // phone -> clientId

        for (let i = 0; i < clients.length; i++) {
            const row = clients[i];
            try {
                if (!row.phone) throw new Error("Telefone obrigatório");

                // Normaliza (tira espaços, pontuação, padroniza +55)
                let phone = row.phone.replace(/\D/g, '');
                if (phone.length === 11 || phone.length === 10) phone = `+55${phone}`;

                let client = await prisma.client.findUnique({
                    where: { phone }
                });

                if (!client) {
                    client = await prisma.client.create({
                        data: {
                            name: row.name || 'Cliente Importado',
                            phone: phone
                        }
                    });
                }

                clientCache[phone] = client.id;
                response.successCount.clients++;
            } catch (err) {
                response.errors.push({ type: 'client', row: i + 1, data: row, error: err.message });
            }
        }

        // 2. Pré-carregar Profissionais e Serviços para fallback
        let defaultProfessional = await prisma.user.findFirst({
            where: {
                OR: [
                    { ownedBarbershops: { some: { id: barbershopId } } },
                    { workedBarbershopId: barbershopId }
                ]
            }
        });

        let defaultService = await prisma.service.findFirst({
            where: { barbershopId }
        });

        const allPros = await prisma.user.findMany({
            where: {
                OR: [
                    { ownedBarbershops: { some: { id: barbershopId } } },
                    { workedBarbershopId: barbershopId }
                ]
            }
        });
        const allServices = await prisma.service.findMany({
            where: { barbershopId }
        });

        // 3. Processar Agendamentos
        for (let i = 0; i < appointments.length; i++) {
            const row = appointments[i];
            try {
                if (!row.client_phone) throw new Error("Telefone do cliente obrigatório para agendamento");

                let phone = row.client_phone.replace(/\D/g, '');
                if (phone.length === 11 || phone.length === 10) phone = `+55${phone}`;

                const clientId = clientCache[phone];
                if (!clientId) {
                    // Tenta achar no banco caso não estivesse na aba de clientes
                    const dbClient = await prisma.client.findUnique({ where: { phone } });
                    if (!dbClient) throw new Error(`Cliente não encontrado com o telefone: ${phone}`);
                    clientCache[phone] = dbClient.id;
                }

                if (!row.date || !row.time) throw new Error("Data e Hora são obrigatórios");

                // Parse Date "YYYY-MM-DD" e "HH:mm"
                const [year, month, day] = row.date.split('-');
                const [hours, minutes] = row.time.split(':');
                const aptDate = new Date(year, month - 1, day, hours, minutes);

                // Tentar Match Profissional e Serviço
                let matchedPro = allPros.find(p => p.name.toLowerCase().includes((row.professional_name || '').toLowerCase()));
                let matchedService = allServices.find(s => s.name.toLowerCase().includes((row.service_name || '').toLowerCase()));

                const finalProId = matchedPro ? matchedPro.id : (defaultProfessional ? defaultProfessional.id : null);
                const finalServiceId = matchedService ? matchedService.id : (defaultService ? defaultService.id : null);

                if (!finalProId || !finalServiceId) {
                    throw new Error("Impossível criar agendamento: Barbearia sem profissional/serviço para fallback.");
                }

                // Check conflict
                const existingApt = await prisma.appointment.findFirst({
                    where: {
                        professionalId: finalProId,
                        date: aptDate,
                        status: { notIn: ['CANCELLED', 'NO_SHOW'] }
                    }
                });

                if (existingApt) {
                    // Conflito
                    throw new Error(`Conflito de horário: O profissional já possui evento em ${row.date} ${row.time}`);
                }

                const aptStatus = (row.status || '').toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'CONFIRMED';
                const paymentStatus = aptStatus === 'COMPLETED' ? 'PAID' : 'PENDING';

                await prisma.appointment.create({
                    data: {
                        date: aptDate,
                        status: aptStatus,
                        paymentStatus: paymentStatus,
                        clientId: clientCache[phone],
                        barbershopId: barbershopId,
                        professionalId: finalProId,
                        serviceId: finalServiceId,
                        notes: "Importado do sistema via TrazMeusDados"
                    }
                });

                response.successCount.appointments++;
            } catch (err) {
                response.errors.push({ type: 'appointment', row: i + 1, data: row, error: err.message });
            }
        }

        return response;
    }
}

module.exports = ImportService;
