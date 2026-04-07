const TutorialService = require('../services/TutorialService');

class TutorialController {
    static async create(req, res) {
        try {
            const tutorial = await TutorialService.create(req.body);
            res.status(201).json(tutorial);
        } catch (error) {
            console.error('[TutorialController] Error creating tutorial:', error);
            res.status(500).json({ message: 'Erro ao criar tutorial' });
        }
    }

    static async list(req, res) {
        try {
            const { category, search } = req.query;
            const tutorials = await TutorialService.list({ category, search });
            res.json(tutorials);
        } catch (error) {
            console.error('[TutorialController] Error listing tutorials:', error);
            res.status(500).json({ message: 'Erro ao buscar tutoriais' });
        }
    }

    static async listAdmin(req, res) {
        try {
            const tutorials = await TutorialService.listAdmin();
            res.json(tutorials);
        } catch (error) {
            console.error('[TutorialController] Error listing tutorials (admin):', error);
            res.status(500).json({ message: 'Erro ao buscar tutoriais' });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const tutorial = await TutorialService.update(id, req.body);
            res.json(tutorial);
        } catch (error) {
            console.error('[TutorialController] Error updating tutorial:', error);
            res.status(500).json({ message: 'Erro ao atualizar tutorial' });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            await TutorialService.delete(id);
            res.status(204).send();
        } catch (error) {
            console.error('[TutorialController] Error deleting tutorial:', error);
            res.status(500).json({ message: 'Erro ao excluir tutorial' });
        }
    }
}

module.exports = TutorialController;
