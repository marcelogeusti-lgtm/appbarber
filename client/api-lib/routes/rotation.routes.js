const express = require('express');
const router = express.Router();
const c = require('../controllers/rotation.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN', 'BARBER', 'RECEPTIONIST'));

router.get('/', c.getConfig);
router.put('/', authorize('ADMIN', 'SUPER_ADMIN'), c.setConfig);

module.exports = router;
