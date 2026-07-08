const express = require('express');
const router = express.Router();
const c = require('../controllers/survey.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Público: cliente responde a pesquisa (via link)
router.post('/submit', c.submit);

// Painel: resultados
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), c.getResults);

module.exports = router;
