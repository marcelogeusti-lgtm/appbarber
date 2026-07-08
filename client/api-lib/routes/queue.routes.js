const express = require('express');
const router = express.Router();
const queue = require('../controllers/queue.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER', 'RECEPTIONIST'));

router.get('/', queue.getQueue);          // ?barbershopId=
router.post('/', queue.addToQueue);
router.post('/call-next', queue.callNext);
router.put('/:id/status', queue.updateStatus);

module.exports = router;
