const express = require('express');
const { updateSchedule, getProfessional, listProfessionals, createProfessional } = require('../controllers/professional.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.put('/schedule', protect, authorize('BARBER', 'ADMIN'), updateSchedule);
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), listProfessionals);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createProfessional);
router.get('/:userId', getProfessional);

module.exports = router;
