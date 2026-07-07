const prisma = require('../lib/prisma');
const { isValid } = require('date-fns');
const logger = require('../lib/logger');

class ImportService {
    /**
     * Importa clientes + agendamentos em lote, com upsert de cliente por
     * telefone, matching de profissional/serviço por nome e dedupe de
     * agendamentos idênticos. Nenhum efeito externo (não dispara notificação):
     * cria registros direto no banco.
     */
    static async processImport(barbershopId, clients = [], appointments = []) {
        logger.info(
            { action: 'import_start', barbershopId, clients: clients.length, appointments: appointments.length },
            'Iniciando importação em lote'
        );

        const response = {
            successCount: { clients: 0, appointments: 0 },
            errors: []
        };

        const clientCache = {}; // phone normalizado -> clientId

        const normalizePhone = (raw) => {
            let phone = String(raw || '').replace(/\D/g, '');
            if (!phone) return null;
            if (phone.startsWith('55') && phone.length > 11) return `+${phone}`;
            if (phone.length <= 11) return `+55${phone}`;
            return `+${phone}`;
        };

        // 1. Clientes (upsert por telefone)
        for (let i = 0; i < clients.length; i++) {
            const row = clients[i];
            try {
                const phone = normalizePhone(row.phone);
                if (!phone) throw new Error('Telefone obrigatório');

                const client = await prisma.client.upsert({
                    where: { phone },
                    update: {
                        name: row.name || undefined,
                        email: row.email || undefined
                    },
                    create: {
                        name: row.name || 'Cliente Importado',
                        phone,
                        email: row.email || null,
                        notes: row.notes || 'Importado via sistema'
                    }
                });

                clientCache[phone] = client.id;
                response.successCount.clients++;
            } catch (err) {
                response.errors.push({ type: 'client', row: i + 1, error: err.message });
            }
        }

        // 2. Pré-carrega profissionais e serviços da barbearia para matching
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

        // 3. Agendamentos
        for (let i = 0; i < appointments.length; i++) {
            const row = appointments[i];
            try {
                const phone = normalizePhone(row.client_phone);
                if (!phone) throw new Error('Telefone do cliente obrigatório');

                let clientId = clientCache[phone];
                if (!clientId) {
                    const dbClient = await prisma.client.findUnique({ where: { phone } });
                    if (!dbClient) throw new Error(`Cliente ${phone} não encontrado.`);
                    clientId = dbClient.id;
                }

                if (!row.date || !row.time) throw new Error('Data e Hora obrigatórios');

                // Parsing flexível: aceita YYYY-MM-DD e DD/MM/YYYY (ano com 2 ou 4 dígitos)
                let aptDate;
                const dateStr = String(row.date).trim();
                const timeStr = String(row.time).trim();
                const [h, min] = timeStr.split(':');

                if (dateStr.includes('-')) {
                    const [y, m, d] = dateStr.split('-');
                    aptDate = new Date(y, m - 1, d, h, min);
                } else if (dateStr.includes('/')) {
                    const [d, m, y] = dateStr.split('/');
                    const fullYear = y.length === 2 ? `20${y}` : y;
                    aptDate = new Date(fullYear, m - 1, d, h, min);
                }

                if (!aptDate || !isValid(aptDate)) throw new Error(`Data inválida: ${row.date} ${row.time}`);

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
                    throw new Error('Nenhum profissional ou serviço cadastrado para vincular. Cadastre ao menos um de cada antes de importar.');
                }

                // Dedupe: mesmo cliente + profissional + horário exato
                const existing = await prisma.appointment.findFirst({
                    where: { clientId, professionalId: finalProId, date: aptDate, status: { not: 'CANCELLED' } }
                });
                if (existing) {
                    response.errors.push({ type: 'appointment', row: i + 1, error: 'Agendamento idêntico já existe.' });
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
                        notes: row.notes || 'Importado'
                    }
                });

                response.successCount.appointments++;
            } catch (err) {
                response.errors.push({ type: 'appointment', row: i + 1, error: err.message });
            }
        }

        logger.info(
            { action: 'import_done', barbershopId, ...response.successCount, errorCount: response.errors.length },
            'Importação concluída'
        );
        return response;
    }
}

module.exports = ImportService;
