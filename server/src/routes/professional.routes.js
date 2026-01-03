const express = require('express');
const { updateSchedule, getProfessional, listProfessionals, createProfessional } = require('../controllers/professional.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.put('/schedule', protect, authorize('BARBER', 'ADMIN'), checkSubscription, updateSchedule);
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, listProfessionals);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, createProfessional);
router.get('/:userId', getProfessional); // Público (ou cliente vendo perfil), não checa ass.

module.exports = router;
