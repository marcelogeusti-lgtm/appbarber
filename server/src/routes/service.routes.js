const express = require('express');
const { createService, getServices, updateService, deleteService } = require('../controllers/service.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', protect, authorize('ADMIN', 'BARBER'), createService);
router.get('/', getServices);
router.put('/:id', protect, authorize('ADMIN', 'BARBER'), updateService);
router.delete('/:id', protect, authorize('ADMIN', 'BARBER'), deleteService);

module.exports = router;
