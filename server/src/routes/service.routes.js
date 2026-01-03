const express = require('express');
const { createService, getServices, updateService, deleteService } = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.post('/', protect, authorize('ADMIN', 'BARBER'), checkSubscription, createService);
router.get('/', getServices);
router.put('/:id', protect, authorize('ADMIN', 'BARBER'), checkSubscription, updateService);
router.delete('/:id', protect, authorize('ADMIN', 'BARBER'), checkSubscription, deleteService);

module.exports = router;
