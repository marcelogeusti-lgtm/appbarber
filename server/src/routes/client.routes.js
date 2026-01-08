const express = require('express');
const router = express.Router();
const { listClients, getClientDetails } = require('../controllers/client.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), listClients);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), getClientDetails);

module.exports = router;
