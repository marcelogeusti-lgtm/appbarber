const express = require('express');
const { updateSchedule, getProfessional, listProfessionals, createProfessional, updateProfessional, deleteProfessional } = require('../controllers/professional.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.put('/schedule', protect, authorize('BARBER', 'ADMIN'), checkSubscription, updateSchedule);
router.route('/')
    .get(protect, authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'), checkSubscription, listProfessionals)
    .post(protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, createProfessional);

router.route('/:id')
    .get(protect, authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'BARBER'), checkSubscription, getProfessional)
    .patch(protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, updateProfessional)
    .delete(protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, deleteProfessional);

module.exports = router;
