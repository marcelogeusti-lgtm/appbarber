const ImportService = require('../services/ImportService');

exports.processImport = async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Não autorizado' });

        const barbershopId = user.barbershopId || user.barbershop?.id || user.ownedBarbershops?.[0]?.id;
        if (!barbershopId) {
            return res.status(400).json({ error: 'Barbearia não vinculada ao usuário' });
        }

        const { clients, appointments } = req.body;
        if (!Array.isArray(clients) && !Array.isArray(appointments)) {
            return res.status(400).json({ error: 'Payload inválido. Esperado clients e appointments.' });
        }

        const result = await ImportService.processImport(barbershopId, clients || [], appointments || []);
        return res.json(result);
    } catch (error) {
        (req.log || require('../lib/logger')).error(
            { err: error, action: 'import_process_failed' },
            'Falha durante o processamento da importação'
        );
        return res.status(500).json({ error: 'Falha durante o processamento da importação.' });
    }
};
