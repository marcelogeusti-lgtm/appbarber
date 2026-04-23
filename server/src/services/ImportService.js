const prisma = require('../lib/prisma');
const { parse, isValid } = require('date-fns');

class ImportService {
    /**
     * Processa a importação de dados em batch com lógica de Upsert
     * @param {string} barbershopId 
     * @param {Array} clients 
     * @param {Array} appointments 
     */
    static async processImport(barbershopId, clients = [], appointments = []) {
        console.log(`[ImportService] Iniciando processo para barbershop ${barbershopId}`);
        
        const response = {
            successCount: { clients: 0, appointments: 0 },
            errors: []
        };

        const clientCache = {}; // phone -> clientId

        // 1. Processar Clientes (Upsert)
        for (let i = 0; i < clients.length; i++) {
            const row = clients[i];
            try {
                if (!row.phone) throw new Error("Telefone obrigatório");

                let phone = row.phone.replace(/\D/g, '');
                if (phone.length === 11 || phone.length === 10) {
                    if (phone.length === 11 && phone[2] === '9') {
                        // Celular BR
                    }
                    phone = `+55${phone}`;
                } else if (!phone.startsWith('55') && phone.length <= 11) {
                    phone = `+55${phone}`;
                } else if (!phone.startsWith('+')) {
                    phone = `+${phone}`;
                }

                // Upsert client
                const client = await prisma.client.upsert({
                    where: { phone },
                    update: {
                        name: row.name || undefined,
                        email: row.email || undefined,
                    },
                    create: {
                        name: row.name || 'Cliente Importado',
                        phone: phone,
                        email: row.email || null,
                        notes: row.notes || 'Importado via sistema'
                    }
                });

                clientCache[phone] = client.id;
                response.successCount.clients++;
            } catch (err) {
                response.errors.push({ type: 'client', row: i + 1, data: row, error: err.message });
            }
        }

        // 2. Pré-carregar dados para matching
        const [allPros, allServices] = await Promise.all([
            prisma.user.findMany({
                where: {
                    OR: [
                        { ownedBarbershops: { some: { id: barbershopId } } },
                        { workedBarbershopId: barbershopId }
                    ]
                }
            }),
            prisma.service.findMany({ where: { barbershopId } })
        ]);

        const defaultProfessional = allPros[0];
        const defaultService = allServices[0];

        // 3. Processar Agendamentos
        for (let i = 0; i < appointments.length; i++) {
            const row = appointments[i];
            try {
                if (!row.client_phone) throw new Error("Telefone do cliente obrigatório");

                let phone = row.client_phone.replace(/\D/g, '');
                if (phone.length <= 11) phone = `+55${phone}`;
                else if (!phone.startsWith('+')) phone = `+${phone}`;

                let clientId = clientCache[phone];
                if (!clientId) {
                    const dbClient = await prisma.client.findUnique({ where: { phone } });
                    if (!dbClient) throw new Error(`Cliente ${phone} não encontrado.`);
                    clientId = dbClient.id;
                }

                if (!row.date || !row.time) throw new Error("Data e Hora obrigatórios");

                // Date Parsing Flexível
                let aptDate;
                const dateStr = row.date.trim();
                const timeStr = row.time.trim();
                
                // Tenta YYYY-MM-DD ou DD/MM/YYYY
                if (dateStr.includes('-')) {
                    const [y, m, d] = dateStr.split('-');
                    const [h, min] = timeStr.split(':');
                    aptDate = new Date(y, m - 1, d, h, min);
                } else if (dateStr.includes('/')) {
                    const [d, m, y] = dateStr.split('/');
                    const [h, min] = timeStr.split(':');
                    const fullYear = y.length === 2 ? `20${y}` : y;
                    aptDate = new Date(fullYear, m - 1, d, h, min);
                }

                if (!aptDate || !isValid(aptDate)) throw new Error(`Data inválida: ${row.date}`);

                // Matching de Profissional e Serviço
                const matchedPro = allPros.find(p => 
                    p.name.toLowerCase().includes((row.professional_name || '').toLowerCase()) ||
                    (row.professional_name || '').toLowerCase().includes(p.name.toLowerCase())
                );
                
                const matchedService = allServices.find(s => 
                    s.name.toLowerCase().includes((row.service_name || '').toLowerCase()) ||
                    (row.service_name || '').toLowerCase().includes(s.name.toLowerCase())
                );

                const finalProId = matchedPro?.id || defaultProfessional?.id;
                const finalServiceId = matchedService?.id || defaultService?.id;

                if (!finalProId || !finalServiceId) {
                    throw new Error("Sem profissional ou serviço cadastrado para vincular.");
                }

                // Evitar duplicidade exata (mesmo cliente, mesmo pro, mesma hora)
                const existing = await prisma.appointment.findFirst({
                    where: {
                        clientId,
                        professionalId: finalProId,
                        date: aptDate,
                        status: { not: 'CANCELLED' }
                    }
                });

                if (existing) {
                    response.errors.push({ type: 'appointment', row: i + 1, data: row, error: "Agendamento idêntico já existe." });
                    continue;
                }

                const status = (row.status || '').toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'CONFIRMED';

                await prisma.appointment.create({
                    data: {
                        date: aptDate,
                        status,
                        paymentStatus: status === 'COMPLETED' ? 'PAID' : 'PENDING',
                        clientId,
                        barbershopId,
                        professionalId: finalProId,
                        serviceId: finalServiceId,
                        notes: row.notes || "Importado via TrazMeusDados"
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

