const express = require('express');
const router = express.Router();
const c = require('../controllers/survey.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { rateLimit } = require('../middlewares/rateLimit.middleware');

const surveySubmitLimit = rateLimit({
    name: 'survey-ip',
    max: 10,
    windowMs: 60 * 60 * 1000,
    message: 'Muitas respostas enviadas. Tente novamente mais tarde.'
});

// Público: cliente responde a pesquisa (via link)
router.post('/submit', surveySubmitLimit, c.submit);

// Painel: resultados
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), c.getResults);

module.exports = router;
