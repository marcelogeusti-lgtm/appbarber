const ImportService = require('../services/ImportService');

class ImportController {
    /**
     * @route POST /api/import/process
     * @desc Processa a importação em lote
     */
    static async processImport(req, res) {
        try {
            // req.user from auth middleware
            const user = req.user;
            if (!user) {
                return res.status(401).json({ error: 'Não autorizado' });
            }

            const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
            
            if (!barbershopId) {
                 return res.status(400).json({ error: 'Barbearia não vinculada ao usuário' });
            }

            const { clients, appointments } = req.body;

            if (!Array.isArray(clients) && !Array.isArray(appointments)) {
                return res.status(400).json({ error: 'Payload inválido. Esperado clients e appointments.' });
            }

            const result = await ImportService.processImport(barbershopId, clients, appointments);

            res.json(result);
        } catch (error) {
            console.error('[ImportController] Erro:', error);
            res.status(500).json({ error: 'Falha durante o processamento da importação.' });
        }
    }
}

module.exports = ImportController;
