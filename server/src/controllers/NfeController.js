const NfeService = require('../services/NfeService');

class NfeController {
    /**
     * List all NFes for a barbershop
     */
    static async list(req, res) {
        try {
            const { barbershopId } = req.params;
            const { clientId, status } = req.query;

            const filters = { barbershopId };
            if (clientId) filters.clientId = clientId;
            if (status) filters.status = status;

            const nfes = await NfeService.listNfes(filters);
            res.json(nfes);
        } catch (error) {
            console.error('[NfeController] list Error:', error);
            res.status(500).json({ error: 'Erro ao listar notas fiscais.' });
        }
    }

    /**
     * Get a single Nfe detail
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const prisma = require('../lib/prisma');
            const nfe = await prisma.nfe.findUnique({
                where: { id },
                include: { client: true, appointment: true, order: true }
            });

            if (!nfe) return res.status(404).json({ error: 'Nota fiscal não encontrada.' });
            res.json(nfe);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar nota fiscal.' });
        }
    }

    /**
     * Manually retry an emission for a failed/pending Nfe
     */
    static async retry(req, res) {
        try {
            const { id } = req.params;
            const prisma = require('../lib/prisma');
            
            const nfe = await prisma.nfe.findUnique({ where: { id } });
            if (!nfe) return res.status(404).json({ error: 'Nota fiscal não encontrada.' });

            if (nfe.status === 'EMITTED') {
                return res.status(400).json({ error: 'Esta nota já foi emitida com sucesso.' });
            }

            // Call emission logic
            const updated = await NfeService.emitNfe({
                barbershopId: nfe.barbershopId,
                clientId: nfe.clientId,
                appointmentId: nfe.appointmentId,
                orderId: nfe.orderId,
                amount: Number(nfe.amount)
            });

            res.json(updated);
        } catch (error) {
            res.status(500).json({ error: error.message || 'Erro ao reemitir nota fiscal.' });
        }
    }

    /**
     * Retroactive emission for an already closed Order
     */
    static async emitRetroactiveOrder(req, res) {
        try {
            const { orderId } = req.params;
            const prisma = require('../lib/prisma');
            const order = await prisma.order.findUnique({ where: { id: orderId } });
            
            if (!order) return res.status(404).json({ error: 'Comanda não encontrada.' });
            if (order.status !== 'PAID' && order.status !== 'CLOSED') {
                return res.status(400).json({ error: 'Comanda não está fechada.' });
            }

            const nfe = await NfeService.emitNfe({
                barbershopId: order.barbershopId,
                clientId: order.clientId,
                orderId: order.id,
                amount: Number(order.total)
            });

            res.json(nfe);
        } catch (error) {
            console.error('[NfeController] Retro Order Error:', error);
            res.status(500).json({ error: error.message || 'Erro ao gerar NFe da comanda' });
        }
    }

    /**
     * Retroactive emission for an already completed Appointment
     */
    static async emitRetroactiveAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const prisma = require('../lib/prisma');
            const appointment = await prisma.appointment.findUnique({ 
                where: { id: appointmentId },
                include: { service: true }
            });
            
            if (!appointment) return res.status(404).json({ error: 'Agendamento não encontrado.' });
            if (appointment.status !== 'COMPLETED') {
                return res.status(400).json({ error: 'Agendamento precisa estar concluído.' });
            }

            const nfe = await NfeService.emitNfe({
                barbershopId: appointment.barbershopId,
                clientId: appointment.clientId,
                appointmentId: appointment.id,
                amount: Number(appointment.service?.price || 0)
            });

            res.json(nfe);
        } catch (error) {
            console.error('[NfeController] Retro Appt Error:', error);
            res.status(500).json({ error: error.message || 'Erro ao gerar NFe do agendamento' });
        }
    }

    /**
     * Manual ad-hoc NFe emission
     */
    static async emitManual(req, res) {
        try {
            const { barbershopId, clientId, amount, description, cpf, cnpj } = req.body;
            
            if (!barbershopId || !clientId || !amount) {
                return res.status(400).json({ error: 'Faltam dados obrigatórios.' });
            }

            if (Number(amount) <= 0) {
                return res.status(400).json({ error: 'O valor deve ser maior que zero.' });
            }

            const prisma = require('../lib/prisma');

            // Strategy B: Capture and save CPF/CNPJ if provided and missing
            if (cpf || cnpj) {
                const client = await prisma.client.findUnique({ where: { id: clientId } });
                if (client) {
                    const updateData = {};
                    if (cpf && !client.cpf) updateData.cpf = cpf;
                    if (cnpj && !client.cnpj) updateData.cnpj = cnpj;

                    if (Object.keys(updateData).length > 0) {
                        await prisma.client.update({
                            where: { id: clientId },
                            data: updateData
                        });
                        console.log(`[NfeController] Updated client ${clientId} documentation during emission.`);
                    }
                }
            }

            const nfe = await NfeService.emitNfe({
                barbershopId,
                clientId,
                amount: Number(amount),
                description // Pass description to service if needed for PDF
            });

            res.json(nfe);
        } catch (error) {
            console.error('[NfeController] Manual Emit Error:', error);
            res.status(500).json({ error: error.message || 'Erro ao gerar NFe avulsa' });
        }
    }
}

module.exports = NfeController;
