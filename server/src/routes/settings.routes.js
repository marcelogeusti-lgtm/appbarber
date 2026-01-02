const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

router.get('/', settingsController.getSettings);
router.put('/:barbershopId', settingsController.updateSettings);

module.exports = router;
