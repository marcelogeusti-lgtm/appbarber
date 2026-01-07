const express = require('express');
const { updateSchedule, getProfessional, listProfessionals, createProfessional, updateProfessional } = require('../controllers/professional.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.put('/schedule', protect, authorize('BARBER', 'ADMIN'), checkSubscription, updateSchedule);
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, listProfessionals);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, createProfessional);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, updateProfessional); // New Route
router.get('/:userId', getProfessional); // Público (ou cliente vendo perfil), não checa ass.

module.exports = router;
