const express = require('express');
const router = express.Router();
const ImportController = require('../controllers/import.controller');

// Importação síncrona/batch em memória
router.post('/process', ImportController.processImport);

module.exports = router;
