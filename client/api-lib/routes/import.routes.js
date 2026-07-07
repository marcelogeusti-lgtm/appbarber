const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Importação em lote de clientes + agendamentos (só dono/admin)
router.post('/process', protect, authorize('ADMIN', 'SUPER_ADMIN'), importController.processImport);

module.exports = router;
