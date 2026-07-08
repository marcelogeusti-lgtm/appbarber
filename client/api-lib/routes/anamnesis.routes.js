const express = require('express');
const router = express.Router();
const c = require('../controllers/anamnesis.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER', 'RECEPTIONIST'));

router.get('/', c.list);
router.get('/:clientId', c.getByClient);
router.post('/', c.upsert);

module.exports = router;
