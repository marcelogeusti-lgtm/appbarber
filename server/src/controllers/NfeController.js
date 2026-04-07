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
}

module.exports = NfeController;
