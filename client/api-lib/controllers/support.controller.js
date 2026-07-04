const AISupportService = require('../services/AISupportService');

class SupportController {
    static async chat(req, res) {
        try {
            const { message } = req.body;
            if (!message) {
                return res.status(400).json({ error: 'A mensagem é obrigatória.' });
            }
            const response = await AISupportService.getChatResponse(message);
            return res.json({ response });
        } catch (error) {
            console.error('Support Controller Error:', error);
            return res.status(500).json({ error: 'Erro ao processar sua dúvida. Tente novamente em instantes.' });
        }
    }
}

module.exports = SupportController;
