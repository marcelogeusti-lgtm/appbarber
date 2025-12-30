const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');

router.get('/:barbershopId/:date', availabilityController.getAvailableSlots);

module.exports = router;
